const User = require('../User/User');
const { checkAndAwardAchievements, calculateStreakForTask } = require('../Auth/achievementChecker');
const { taskMap } = require('../data/programData');

function isTaskUpdateQualifying(task) {
  if (!task || !task.id) return false;
  
  const taskDefinition = taskMap[task.id];
  if (!taskDefinition) return false;

  switch (task.id) {
    case '1': // Sun Exposure
      return task.progress >= 50;
    case '2': // Weight Training
      return task.progress > 0;
    case '3': // Eat a meal
      return task.progress >= 75;
    case '4': // Sleep
      return task.progress >= 87.5;
    case '5': // Supplements
      return task.checked && task.checked.length === 4;
    
    // Inverted Tasks (Dont's)
    case 'd1': // Masturbation
      return task.progress < 50; // Qualifies if they did NOT do it
    case 'd2': // Stress Level
      const stressValue = (task.progress / 100) * taskDefinition.maxValue;
      return stressValue < taskDefinition.goal;
    case 'd3': // Alcohol Consumption
      const alcoholValue = (task.progress / 100) * taskDefinition.maxValue;
      return alcoholValue < taskDefinition.goal;
      
    default:
      return false;
  }
}

const updateTask = async (req, res) => {
  const { userId, date, task, dailyNgDl } = req.body;

  if (!userId || !date || !task || !task.id) {
    return res.status(400).send('Missing required fields.');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const existingTaskIndex = user.tasks.findIndex(
      (t) => t.taskId === task.id && new Date(t.date).toDateString() === taskDate.toDateString()
    );

    if (existingTaskIndex > -1) {
      // Update existing task
      const taskToUpdate = user.tasks[existingTaskIndex];
      
      if (task.id === '3') { // meals task
        if (!taskToUpdate.history) taskToUpdate.history = [];
        taskToUpdate.history.push({ value: task.progress, description: task.description, timestamp: new Date() });
        // Recalculate progress based on the full history
        taskToUpdate.progress = taskToUpdate.history.reduce((sum, entry) => sum + (entry.value < 50 ? -(100 - entry.value) : entry.value), 0);
      } else {
        taskToUpdate.progress = task.progress;
      }

      if (task.checked) {
        taskToUpdate.checked = task.checked;
      }
    } else {
      // Add new task
      const newTask = {
        taskId: task.id,
        date: taskDate,
        progress: task.progress,
      };
      if (task.id === '3') {
        newTask.history = [{ value: task.progress, description: task.description, timestamp: new Date() }];
      }
      if (task.checked) {
        newTask.checked = task.checked;
      }
      user.tasks.push(newTask);
    }
    
    user.markModified('tasks');

    // --- New Per-Task Streak Logic ---
    console.log(`[Streak Debug] --- Starting streak check for task: ${task.id} ---`);
    const isQualifying = isTaskUpdateQualifying(task);
    console.log(`[Streak Debug] Is task update qualifying? ${isQualifying}`);

    const newStreakCount = calculateStreakForTask(user.tasks, task.id);
    console.log(`[Streak Debug] Calculated new streak count: ${newStreakCount}`);
    
    let showStreakNotification = false;
    const today = new Date().toDateString();
    console.log(`[Streak Debug] Today's date string: ${today}`);

    // Get the streak data for the current task from the map
    const taskStreakData = user.streaks.get(task.id) || {
      currentStreak: 0,
      lastUpdate: null,
      lastNotificationDate: null
    };

    const lastNotificationDate = taskStreakData.lastNotificationDate ? new Date(taskStreakData.lastNotificationDate).toDateString() : null;
    console.log(`[Streak Debug] Last notification date string: ${lastNotificationDate}`);

    const shouldShowNotification = isQualifying && newStreakCount > 0 && today !== lastNotificationDate;
    console.log(`[Streak Debug] Should show notification? ${shouldShowNotification} (isQualifying: ${isQualifying}, newStreakCount: ${newStreakCount}, today !== lastNotificationDate: ${today !== lastNotificationDate})`);

    if (shouldShowNotification) {
      showStreakNotification = true;
      taskStreakData.lastNotificationDate = new Date();
    }
    
    taskStreakData.currentStreak = newStreakCount;
    taskStreakData.lastUpdate = new Date();
    user.streaks.set(task.id, taskStreakData);
    user.markModified('streaks');
    
    await user.save();

    // Check for new achievements (which no longer handles streaks)
    const achievementResult = await checkAndAwardAchievements(userId, dailyNgDl);

    const updatedUser = await User.findById(userId);

    res.status(200).send({
      message: 'Task updated successfully.',
      user: updatedUser,
      newAchievements: achievementResult ? achievementResult.newAchievements : [],
      streak: { taskId: task.id, count: newStreakCount }, // Send task-specific streak
      showStreakNotification,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = updateTask;
