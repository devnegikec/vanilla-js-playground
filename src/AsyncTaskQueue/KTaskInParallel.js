class ParallelTaskRunner {
	constructor(tasks, concurrency) {
		if(concurrency <=0 ) {
			throw new Error("Concurrency must be greater the 0");
		}
		this.tasks = tasks;
		this.concurrency = concurrency;
		this.totlaTasks = tasks.length;
		this.nextTaskIndex = 0;
		this.completedTasks = 0;
		this.results = new Array(this.totlaTasks);

		this.resolvePromise = null;
	}

	run() {
		
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
			const initialRuns = Math.min(this.concurrency, this.totlaTasks);
			for (let i =0; i < initalRuns, i++) {
				this.#nextTask();
			}
		})
	}

	#nextTask() {
		if(this.nextTaskIndex >= this.totlaTasks) {
			return;
		}

		const currentIndex = this.nextTaskIndex;
		const task = this.tasks[currentIndex];
		this.nextTaskIndex++;

		console.log(`[STARTING] Task ${currentIndex + 1}/${this.totalTasks}`);

		task()
			.then(result => {
				 console.log(`[FINISHED] Task ${currentIndex + 1} succeeded.`);
                this.results[currentIndex] = { status: 'fulfilled', value: result };
			})
			.catch(error => {
				console.error(`[FAILED]   Task ${currentIndex + 1} failed.`);
                this.results[currentIndex] = { status: 'rejected', reason: error };
			})
			.finally(() => {
				this.completedTasks++;
				if(this.completedTasks === this.totlaTasks) {
					this.resolvePromise(this.results);
				} else {
					this.#nextTask();
				}

			})

	}

}