function runTasks(taskList) {
    const taskMap = new Map(taskList.map(task => [task.name, task]));

    const promisesCache = new Map();

    function processTask(taskName) {
        if (promisesCache.has(taskName)) {
            return promisesCache.get(taskName);
        }

        const task = taskMap.get(taskName);
        if (!task) {
            return Promise.reject(new Error(`Dependency task "${taskName}" not found.`));
        }
        const taskPromise = (async () => {
            const dependencyPromises = task.dep.map(depName => processTask(depName));
            await Promise.all(dependencyPromises);

            console.log(`🚀 Starting task: ${task.name}`);
            await new Promise(resolve => {
                task.fun(resolve); // The `resolve` function acts as the `finished` callback.
            });
        })();
        promisesCache.set(taskName, taskPromise);
        return taskPromise;
    }

    const allTasksPromises = taskList.map(task => processTask(task.name));

    return Promise.all(allTasksPromises);
}



function createTask(time, name) {
    return function (finished) {
        setTimeout(function() {
            console.log(`✅ Task finished: ${name}`);
            finished(); // Signal that the task is done.
        }, time);
    };
}

// The list of tasks with their names, dependencies, and functions.
const tasks = [{
    name: 'C',
    dep: ['A', 'B'],
    fun: createTask(1000, 'C'),
}, {
    name: 'E',
    dep: ['D'],
    fun: createTask(1000, 'E'),
}, {
    name: 'D',
    dep: [],
    fun: createTask(1000, 'D'),
}, {
    name: 'A',
    dep: [],
    fun: createTask(100, 'A'),
}, {
    name: 'B',
    dep: [],
    fun: createTask(100, 'B'),
}, {
    name: 'F',
    dep: ['C', 'E'],
    fun: createTask(500, 'F'),
}];



// --- Run the scheduler ---
console.log("Starting task scheduler...");
runTasks(tasks)
    .then(() => {
        console.log("\n🎉 All tasks have been completed successfully!");
    })
    .catch(error => {
        console.error("\n❌ An error occurred during task execution:", error);
    });
