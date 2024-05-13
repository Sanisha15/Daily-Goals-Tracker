document.addEventListener('DOMContentLoaded', function () {
    const goalInput = document.getElementById('goalInput');
    const addGoalButton = document.getElementById('addGoal');
    const goalList = document.getElementById('goalList');
    const deleteAllButton = document.getElementById('deleteAll');
    const completedGoalsList = document.getElementById('completedGoalsList');

    // Load goals from storage
    chrome.storage.sync.get(['goals'], function (result) {
        if (result.goals) {
            result.goals.forEach(goal => {
                addGoalToList(goal.text, goal.completed, goal.id); // Pass both text, completion status, and goalId
            });
        }
    });

    // Add a new goal
    addGoalButton.addEventListener('click', function () {
        const goalText = goalInput.value.trim();
        if (goalText !== '') {
            const goalId = uuidv4(); // Generate a unique goalId
            addGoalToList(goalText, false, goalId); // Initialize the goal as incomplete with a unique goalId
            goalInput.value = '';

            // Save goals to storage
            chrome.storage.sync.get(['goals'], function (result) {
                const goals = result.goals || [];
                goals.push({ id: goalId, text: goalText, completed: false }); // Store both text, completion status, and goalId
                chrome.storage.sync.set({ goals: goals });
            });
        }
    });

    // Add event listener for Delete All button
    deleteAllButton.addEventListener('click', function () {
        removeAllGoals();
    });

    // Function to remove all goals
    function removeAllGoals() {
        if (goalList) {
            goalList.innerHTML = ''; // Remove all children (goals)
        }
        if (completedGoalsList) {
            completedGoalsList.innerHTML = ''; // Remove all completed goals
        }
        // Remove all goals from storage
        chrome.storage.sync.remove('goals');
    }

   // Function to add a goal to the list
    function addGoalToList(goalText, completed, goalId) {
        // Ensure goalText is a string
        if (typeof goalText !== 'string') {
            console.error('Invalid goal text:', goalText);
            return; // Exit the function if goalText is not a string
        }

        const goalContainer = completed ? completedGoalsList : goalList; // Determine where to append the goal

        // Check if goal container exists
        if (!goalContainer) {
            console.error('Goal container not found:', completed ? 'completedGoalsList' : 'goalList');
            return;
        }

        const li = document.createElement('li');
        li.textContent = goalText;

        // Apply styles to the list item
        li.style.border = '1px solid #ccc';
        li.style.padding = '10px';
        li.style.marginBottom = '10px';
        li.style.wordWrap = 'break-word'; // Ensure text wraps within the box

        if (completed) {
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.style.marginLeft = '10px';
            removeButton.addEventListener('click', function () {
                removeGoalFromStorage(goalId); // Remove the goal from storage when the Remove button is clicked
                li.remove(); // Remove the goal from the UI
            });
            li.appendChild(removeButton);
        }

        goalContainer.appendChild(li);

        // Toggle completed status when goal is clicked (only for goals in original list)
        if (!completed) {
            li.addEventListener('click', function () {
                li.classList.toggle('completed');
                updateGoalStatus(goalId, li.classList.contains('completed'));
            });
        }
    }


    // Function to update goal status in storage
    function updateGoalStatus(goalId, completed) {
        chrome.storage.sync.get(['goals'], function (result) {
            const goals = result.goals || [];
            const index = goals.findIndex(goal => goal.id === goalId);
            if (index !== -1) {
                // Update goal status in storage
                goals[index].completed = completed;
                chrome.storage.sync.set({ goals: goals });
            }
        });
    }

    // Function to remove a goal from storage
    function removeGoalFromStorage(goalId) {
        chrome.storage.sync.get(['goals'], function (result) {
            let goals = result.goals || [];
            goals = goals.filter(goal => goal.id !== goalId); // Filter out the goal with the given goalId
            chrome.storage.sync.set({ goals: goals });
        });
    }

    // UUID generator function
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Set up button functionality for addGoalButton
    setupButton(addGoalButton);

    // Set up button functionality for deleteAllButton
    setupButton(deleteAllButton);
});

// Function to add "Delete All" button for completed goals
function addDeleteAllButton() {
    const deleteAllButton = document.createElement('button');
    deleteAllButton.textContent = 'Delete All';
    deleteAllButton.addEventListener('click', function () {
        removeAllCompletedGoals();
    });
    completedGoalsList.prepend(deleteAllButton);
}

// Function to remove all completed goals from storage and UI
function removeAllCompletedGoals() {
    if (completedGoalsList) {
        completedGoalsList.innerHTML = ''; // Remove all completed goals from UI

        // Remove all completed goals from storage
        chrome.storage.sync.get(['goals'], function (result) {
            let goals = result.goals || [];
            goals = goals.filter(goal => !goal.completed); // Filter out completed goals
            chrome.storage.sync.set({ goals: goals });
        });
    }
}

// Call the function to add "Delete All" button for completed goals
addDeleteAllButton();
