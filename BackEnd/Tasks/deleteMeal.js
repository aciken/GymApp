const User = require('../User/User');

const deleteMeal = async (req, res) => {
    const { userId, timestamp, taskId } = req.body;

    if (!userId || !timestamp || !taskId) {
        return res.status(400).json({ message: 'User ID, timestamp, and task ID are required.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let mealFoundAndDeleted = false;
        const targetTime = new Date(timestamp).getTime();

        // Correctly iterate through all tasks to find the meal
        for (const task of user.tasks) {
            // Check only meal tasks that have a history
            if (task.taskId === taskId && task.history && task.history.length > 0) {
                const initialLength = task.history.length;
                
                task.history = task.history.filter(meal => {
                    const mealTime = new Date(meal.timestamp).getTime();
                    return mealTime !== targetTime;
                });

                if (task.history.length < initialLength) {
                    mealFoundAndDeleted = true;
                    break; // Exit the loop once the meal is found and deleted
                }
            }
        }

        if (mealFoundAndDeleted) {
            await user.save();
            const updatedUser = await User.findById(userId);
            return res.status(200).json({ message: 'Meal deleted successfully.', user: updatedUser });
        } else {
            return res.status(404).json({ message: 'Meal not found in history.' });
        }

    } catch (error) {
        console.error('Error deleting meal:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = deleteMeal;
