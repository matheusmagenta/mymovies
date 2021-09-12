myMovies app

this is my first end to end project from scratch. 

a notebook to keep my own movie reviews and watchlist, to find recommendations and to know where to watch those films.

1. basic approach
firstly, i had two main learning objectives: consume a third-party api and write a crud. 
so, i wrote a basic frontend project with html, css and vanilla javascript. i spent a lot of time handling errors trying to get my asynchronous requests work. many 'nulls' later, i got it right. the next step involved code the navigation process: links, movie details, pagination search results etc. then, the last step in this basic approach was write crud operations. specifically, add movies and reviews to a list, retrieve these movies and reviews and edit and delete them. i had to deal with a lot of errors again: adding wrongly the same movie to the list, editing one review and breaking the other ones, finding the movie added in a new search but without its review already saved, trying to keep track of state using arrays and localstorage but mixing which data i wanted to render. well, the bugs were solved slowly, one by one.

time to the next step: refactor as a front and backend project (full stack) 

2. end to end project (node.js, express, ejs and mongodb)
this would come as a surprise to me while i was writing the code, but using node.js, express and mongodb made my frontend approach a lot easier than i expected. specially the routes, which avoided a lot of conflicts around handling and rendering data. i think it is more simple to use database than local or session storage, for example. templating engine was another improvement, much more concise and less redundance. 
so, the first step was setup the project: stack, dependencies etc.    

3. improvements