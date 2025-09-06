class AsyncTaskQueue {

    constructor()

}

const queue = new AsyncTaskQueue(2);

const task1 = () => new Promise((resolve) => setTimeout(() => resolve('Task 1 complete'), 1000));
const task2 = () => new Promise((resolve) => setTimeout(() => resolve('Task 2 complete'), 500));
const task3 = () => new Promise((resolve) => setTimeout(() => resolve('Task 3 complete'), 2000));
const task4 = () => new Promise((resolve) => setTimeout(() => resolve('Task 4 complete'), 1500));

queue.add(task1);
queue.add(task2);
queue.add(task3);
queue.add(task4);

