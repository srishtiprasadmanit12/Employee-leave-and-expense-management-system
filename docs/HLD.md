                  React Frontend
                        |
                    REST APIS
                        |
                  EXPRESS server
                        |
|--------------------|------------|---------------|
auth module      employee         Leave  Expense module
                    |_______________|
                            |
                      Service layer
                            |
                      Repository layer
                            |
        |-------------------------------------|
      Mongo Db                              Redis Cache
  |---------|-------|
  Users.  leaves  expenses

