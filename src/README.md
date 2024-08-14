<!-- # improvements to make -->

# classroom token generation issue.
[Problem]
While a teacher enters to a classroom the classroomToken is provided via the classroom details fetching API. Fetching route is made to run everytime the component rerenderes for  real time data. Hence the classroomToken is also generated and kept in cookies everytime the fetching happens.. which is an unwanted process 

[Solution]
Create a seperate API endpoint  to create the token when the user clicks the enter button. Generate the token using seperate interactor.

# setup interactor and intefaces for socket library. Follow the cleaner code.