class AsyncTaksQueue {
    concurrency;
    runningCount;
    taskQueue;
    constructor(concurrency) {
        if (typeof concurrency !== 'number' || concurrency <= 0) {
            throw new Error('Concurrency must be a positive number');
        }
        this.concurrency = concurrency;
        this.runningCount = 0;
        this.taskQueue = [];
    }


    queue(taks) {
        if (typeof taks !== 'function') {
            throw new Error('Task must be a function');
        }
        this.taskQueue.push(taks);
        this._runNext();
    }

    _runNext() {
        while(this.runningCount < this.concurrency && this.taskQueue.length >0 ) {
            const taskToRun = this.taskQueue.shift();
            this.runningCount++;
            Promise.resolve(taskToRun())
                .cactch(() => {
                    // ignore errors
                    // or catch erro 
                })
                .finally(() => {
                    this.runningCount--;
                    this._runNext();
                })
        }
    }
}

const queue = new AsyncTaskQueue(2); // Allow up to 2 tasks to run concurrently

// Example async tasks

const task1 = () => new Promise((resolve) => setTimeout(() => resolve("Task 1 done"), 1000));

const task2 = () => new Promise((resolve, reject) => setTimeout(() => reject("Task 2 failed"), 500));

const task3 = () => new Promise((resolve) => setTimeout(() => resolve("Task 3 done"), 200));

// Queue tasks

queue.queue(task1); // Starts immediately

queue.queue(task2); // Starts immediately (concurrency = 2)

queue.queue(task3); // Waits until one of the first two tasks completes