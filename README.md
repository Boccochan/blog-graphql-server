# blog-graphql-server
Server side for blog

# Overview
This graphql server provides a simple blog api. The system uses mysql and redis.
You need to setup them. If you want to run this software on postgress or the other RDB, you can change createOptions of options.ts. It should work.

# Setup

Install packages.

```
$ yarn install
```

Set environment variables.

```
$ export DB_NAME='your database name'
$ export DB_USER_NAME='your user name of the database'
$ export DB_PASSWORD='your password of the database'
```

Create database on mysql.  

```
$ create database 'your database name'
```

# Run

```
$ yarn start
```


