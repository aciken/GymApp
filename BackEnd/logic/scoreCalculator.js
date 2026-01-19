const programData = require('../data/programData');

function calculateCurrentTScore(user) {
    const baseline = user.baselineTestosterone || 290;

    if (!user || !user.tasks || user.tasks.length === 0) {
        return baseline;
    }

    const { dailyDos, dailyDonts } = programData;
    const allTasks = [...dailyDos, ...dailyDonts];
    const taskMap = allTasks.reduce((map, task) => {
        map[task.id] = { ...task };
        return map;
    }, {});

    const dateCreated = new Date(user.dateCreated);
    const today = new Date();
    dateCreated.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const programDuration = Math.max(1, Math.ceil((today - dateCreated) / (1000 * 60 * 60 * 24)) + 1);
    
    const totalPossiblePositiveImpact = dailyDos.reduce((sum, task) => sum + (task.impact || 0), 0);
    const totalPossibleNegativeImpact = 
        dailyDonts.reduce((sum, task) => sum + (task.impact || 0), 0) +
        dailyDos.filter(t => t.type === 'meals' || t.id === 'sleep').reduce((sum, task) => sum + (task.impact || 0), 0);

    const dailyPositiveContributions = Array(programDuration).fill(0);
    const dailyNegativeContributions = Array(programDuration).fill(0);

    user.tasks.forEach(savedTask => {
        const taskInfo = taskMap[savedTask.taskId];
        if (!taskInfo) return;

        const taskDate = new Date(savedTask.date);
        taskDate.setHours(0,0,0,0);
        const dayIndex = Math.round((taskDate - dateCreated) / (1000 * 60 * 60 * 24));
        
        let contribution;
        if (taskInfo.id === 'sleep') {
            const hoursSlept = ((savedTask.progress || 0) / 100) * taskInfo.goal;
            let impactMultiplier;
            if (hoursSlept < 7) {
                const deficit = 7 - hoursSlept;
                impactMultiplier = -Math.min(deficit / 3, 1);
            } else if (hoursSlept < 8) {
                impactMultiplier = 0;
            } else {
                const surplus = hoursSlept - 8;
                impactMultiplier = Math.min(surplus / 2, 1);
            }
            contribution = impactMultiplier * taskInfo.impact;
        } else if (taskInfo.type === 'slider' && !taskInfo.inverted) {
            const actualValue = ((savedTask.progress || 0) / 100) * taskInfo.goal;
            const impactMultiplier = taskInfo.goal > 0 ? Math.min(actualValue / taskInfo.goal, 2) : 0;
            contribution = impactMultiplier * taskInfo.impact;
        } else if (taskInfo.type === 'slider' && taskInfo.inverted) {
            const progressPercent = (savedTask.progress || 0) / 100;
            contribution = -1 * progressPercent * taskInfo.impact;
        } else if (taskInfo.type === 'meals') {
            if ((savedTask.progress || 0) < 0) {
                contribution = (savedTask.progress || 0) * taskInfo.impact / 100;
            } else {
                contribution = ((savedTask.progress || 0) / 100) * taskInfo.impact;
            }
        } else {
            const progressPercent = (savedTask.progress || 0) / 100;
            contribution = taskInfo.inverted 
                ? -1 * progressPercent * taskInfo.impact
                : progressPercent * taskInfo.impact;
        }
        
        if (dayIndex >= 0 && dayIndex < programDuration) {
            if (contribution > 0) {
                dailyPositiveContributions[dayIndex] += contribution;
            } else {
                dailyNegativeContributions[dayIndex] += contribution;
            }
        }
    });

    const dailyContributions = Array(programDuration).fill(0);
    
    for (let i = 0; i < programDuration; i++) {
        const scaledPositive = totalPossiblePositiveImpact > 0
            ? (dailyPositiveContributions[i] / totalPossiblePositiveImpact) * 8
            : 0;
        
        const scaledNegative = totalPossibleNegativeImpact > 0
            ? (dailyNegativeContributions[i] / totalPossibleNegativeImpact) * 3
            : 0;
        
        const netChange = scaledPositive + scaledNegative;
        
        if (i === 0) {
            dailyContributions[i] = baseline + netChange;
        } else {
            dailyContributions[i] = dailyContributions[i-1] + netChange;
        }
    }

    const rawFinalScore = dailyContributions[dailyContributions.length - 1];
    const finalScore = Math.max(200, Math.min(1100, rawFinalScore));
    
    return Math.round(finalScore);
}

module.exports = { calculateCurrentTScore };
