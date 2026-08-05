## Building a Worker Pool in Go

In this series of articles, we'll explore one of the most widely used concurrency patterns in Go: the **Worker Pool**.

We'll learn what a worker pool is, why it exists, and when you should use it. More importantly, we'll implement several versions using Go's concurrency primitives, compare different approaches, and discuss the trade-offs and performance characteristics of each implementation.

## What Is a Worker Pool?

Between the 1960s and the 1980s, computer scientists developed techniques to efficiently manage the creation and scheduling of threads and processes. Since creating these resources is relatively expensive, they introduced the concept of **worker pools** (also known as **thread pools**), where a fixed number of workers are created in advance and reused to execute multiple tasks.

Instead of continuously creating and destroying threads, applications reuse existing workers, significantly reducing overhead and improving performance for CPU-intensive and I/O-intensive workloads.

Later, with the rise of web servers, developers faced the challenge of handling thousands of incoming client requests while making efficient use of the server's hardware resources. The worker pool pattern became a natural solution because it limits the amount of concurrent work while maximizing resource utilization.

Today, worker pools remain one of the fundamental concurrency patterns. Almost every modern web server, runtime, and application framework uses some variation of this technique to efficiently serve requests.

## Let's Implement Our First Worker Pool in Go

Now that we have a basic understanding of the worker pool pattern, it's time to build one in Go.

We won't build anything fancy just yet—our goal is simply to understand the core idea and see how everything works behind the scenes.

Our implementation will follow four simple steps:

1. Create a fixed number of workers.
2. Send jobs through a channel.
3. Let each worker process incoming jobs.
4. Collect the results.

By the end of this implementation, you'll have a solid understanding of how worker pools work internally. Later in this series, we'll extend it with graceful shutdown, context cancellation, error handling, dynamic worker scaling, and more.

## Defining the `Job` and `Result` Types

Let's begin by defining the data structures our worker pool will use.

```go
type Job struct {
	ID byte
}

type Result struct {
	WorkerID byte
	JobID    byte
}
```

`Job` represents a unit of work. In a real application, this could be a database query, an HTTP request, image processing, file compression, or any other task.

For now, we'll keep it simple and only store an ID.

`Result` represents the output of a processed job. In real-world applications, it may also include processed data, errors, execution time, or any additional metadata.

## Implementing the Worker

Now let's implement the heart of our worker pool: the worker function.

```go
func worker(id byte, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()

	// Process jobs until the channel is closed.
	for job := range jobs {
		fmt.Printf("Job %d is being processed by worker %d\n", job.ID, id)

		// Simulate some work.
		time.Sleep((time.Duration(rand.Intn(3)) + 1) * time.Second)

		fmt.Printf("Job %d completed by worker %d\n", job.ID, id)

		results <- Result{
			WorkerID: id,
			JobID:    job.ID,
		}
	}

	fmt.Printf("Worker %d has stopped\n", id)
}
```

As you can see, there's nothing particularly complicated here.

The worker receives:

* its ID,
* a **receive-only** jobs channel,
* a **send-only** results channel,
* and a `sync.WaitGroup` used to notify the main goroutine when the worker exits.

Inside the loop, the worker continuously receives jobs from the `jobs` channel, processes them, and sends the corresponding `Result` to the `results` channel. Once the `jobs` channel is closed, the loop exits and the worker terminates.

## Initializing the Jobs

Let's create a helper function that generates our jobs.

```go
func initJobs(jobs chan<- Job) {
	for i := range NumOfJobs {
		jobs <- Job{ID: byte(i)}
	}

	// No more jobs.
	close(jobs)
}
```

This function simply sends `NumOfJobs` jobs into the channel and closes it afterward so the workers know there is no more work to process.

## Assembling Everything

Now let's wire everything together inside `main()`.

```go
func main() {
	jobs := make(chan Job, NumOfJobs) // buffered channel
	results := make(chan Result)      // unbuffered channel

	for i := range NumOfWorkers {
		wg.Add(1)
		go worker(byte(i+1), jobs, results, &wg)
	}

	go initJobs(jobs)

	wg.Wait()
	close(results)

	for result := range results {
		fmt.Printf("Job %d was processed by worker %d\n", result.JobID, result.WorkerID)
	}

	fmt.Println("All jobs have been processed.")
}
```

Everything looks correct at first glance.

Let's run it.

![screen shot](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/y3xoqpvu68igvrxeg2vc.png)

Oops! We immediately hit a **deadlock**.

I intentionally kept this mistake because it's a great reminder that concurrent programming requires careful coordination. If you're not careful, you'll eventually run into problems such as deadlocks or race conditions.

## Why Does the Deadlock Happen?

Inside the worker, we send the result through an **unbuffered** channel:

```go
results <- Result{
	WorkerID: id,
	JobID:    job.ID,
}
```

Sending on an unbuffered channel blocks until another goroutine receives the value.

Meanwhile, the main goroutine is waiting here:

```go
wg.Wait()
```

before it starts reading from the `results` channel.

This creates a circular dependency:

* Every worker is blocked trying to send a result.
* The main goroutine is blocked waiting for every worker to finish.
* The workers cannot finish because they're blocked on the channel send.

Since no goroutine can make progress, the Go runtime detects a deadlock.

## Fixing the Deadlock

Fortunately, the fix is simple.

We'll introduce what I like to call a **closer goroutine**. Its only responsibility is to wait until every worker finishes and then close the `results` channel.

```go
go func() {
	wg.Wait()
	close(results)
}()
```

Our final `main()` function now looks like this:

```go
func main() {
	jobs := make(chan Job, NumOfJobs) // buffered channel
	results := make(chan Result)      // unbuffered channel

	for i := range NumOfWorkers {
		wg.Add(1)
		go worker(byte(i+1), jobs, results, &wg)
	}

	go initJobs(jobs)

	// Closer goroutine.
	go func() {
		wg.Wait()
		close(results)
	}()

	for result := range results {
		fmt.Printf("Job %d was processed by worker %d\n", result.JobID, result.WorkerID)
	}

	fmt.Println("All jobs have been processed.")
}
```

Now the main goroutine immediately starts consuming results, allowing workers to continue sending values without blocking indefinitely. Once all workers exit, the closer goroutine closes the `results` channel, which naturally terminates the `range` loop.

Another way to solve this problem is to start consuming the `results` channel before calling `wg.Wait()`. The important takeaway is that **an unbuffered channel always requires a receiver**. Otherwise, every sender will eventually block.

## Conclusion

For this first implementation, I intentionally kept everything simple so we could focus on understanding the worker pool pattern itself.

Even with this small example, we've already covered several important Go concurrency concepts:

* Goroutines
* Channels
* Directional channels
* `sync.WaitGroup`
* Closing channels
* Understanding and fixing deadlocks

In the next part of this series, we'll continue improving our worker pool by exploring more of the `sync` package, writing proper tests with Go's `testing` package, and benchmarking different implementations to better understand their performance characteristics.
The complete source code for this article is available on GitHub:

- **GitHub:** https://github.com/aymane-belassiria/worker-pool-series/tree/main/golang/worker-pool-v1
