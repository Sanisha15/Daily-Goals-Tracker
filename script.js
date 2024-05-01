document.addEventListener('DOMContentLoaded', function () {
    const goalInput = document.getElementById('goalInput');
    const addGoalButton = document.getElementById('addGoal');
    const goalList = document.getElementById('goalList');
    const deleteAllButton = document.getElementById('deleteAll'); 

    // Load goals from storage
    chrome.storage.sync.get(['goals'], function (result) {
        if (result.goals) {
            result.goals.forEach(goal => {
                addGoalToList(goal);
            });
        }
    });

    // Add a new goal
    addGoalButton.addEventListener('click', function () {
        const goalText = goalInput.value.trim();
        if (goalText !== '') {
            addGoalToList(goalText);
            goalInput.value = '';

            // Save goals to storage
            chrome.storage.sync.get(['goals'], function (result) {
                const goals = result.goals || [];
                goals.push(goalText);
                chrome.storage.sync.set({ goals: goals });
            });
        }
    });

    // Add event listener for Delete All button
    deleteAllButton.addEventListener('click', function () {
        removeAllGoals();
        
        const existingQuote = document.getElementById('quote');
        if (existingQuote) {
            existingQuote.remove();
        }
    });

    // Function to remove all goals
    function removeAllGoals() {
        if (goalList) {
            goalList.innerHTML = ''; // Remove all children (goals)
            // Remove all goals from storage
            chrome.storage.sync.remove('goals', function () {
                console.log('All goals removed.');
            });
        }
    }

    // Function to display quote
    function displayquote() {
        // Display the quote on the page
        const quoteElement = document.createElement('p');
        quoteElement.textContent = "HURRAY! ALL GOALS ARE COMPLETED.";
        quoteElement.style.fontSize = '15px';

        quoteElement.id = 'quote';
        document.body.appendChild(quoteElement);
    }

    // Function to add a goal to the list
    function addGoalToList(goalText) {
        // Ensure goalText is a string
        if (typeof goalText !== 'string') {
            console.error('Invalid goal text:', goalText);
            return; // Exit the function if goalText is not a string
        }

        const goalList = document.getElementById('goalList');

        // Remove existing quote if it exists
        const existingQuote = document.getElementById('quote');
        if (existingQuote) {
            existingQuote.remove();
        }

        // Check if goal list exists
        if (!goalList) {
            const newGoalList = document.createElement('ul');
            newGoalList.id = 'goalList';
            document.body.appendChild(newGoalList);
        }

        const li = document.createElement('li');
        li.textContent = goalText;

        goalList.appendChild(li);

        // Toggle completed status when goal is clicked
        li.addEventListener('click', function () {
            li.classList.toggle('completed');
            updateGoalStatus(goalText, li.classList.contains('completed'));
            
            // Check if any uncompleted goal exists
            const uncompletedGoals = Array.from(goalList.childNodes).some(node => !node.classList.contains('completed'));
            if (uncompletedGoals) {
                // Remove existing quote if it exists
                const existingQuote = document.getElementById('quote');
                if (existingQuote) {
                    existingQuote.remove();
                }
            } else {
                // Remove existing quote if it exists
                const existingQuote = document.getElementById('quote');
                if (existingQuote) {
                    existingQuote.remove();
                }
                displayquote();
            }
            
        });
    }

    // Function to update goal status in storage
    function updateGoalStatus(goalText, completed) {
        chrome.storage.sync.get(['goals'], function (result) {
            const goals = result.goals || [];
            const index = goals.indexOf(goalText);
            if (index !== -1) {
                goals[index] = { text: goalText, completed: completed };
                chrome.storage.sync.set({ goals: goals });
            }
        });
    }
// Button functionality to change color on hover and on click
function setupButton(button) {
    button.addEventListener('mouseover', function () {
        // Change button color on hover
        button.style.backgroundColor = ' #b373f8';
    });

    button.addEventListener('mouseout', function () {
        // Revert button color on mouseout
        button.style.backgroundColor = ' #842ae5'; // Revert to original color
    });

    button.addEventListener('click', function () {
        // Change button color on click
        button.style.backgroundColor = '#ffac09';

        // Revert button color after a brief period
        setTimeout(() => {
            button.style.backgroundColor = ' #842ae5'; // Revert to original color
        }, 300); 
    });
}

// Set up button functionality for addGoalButton
setupButton(addGoalButton);

// Set up button functionality for deleteAllButton
setupButton(deleteAllButton);


});
