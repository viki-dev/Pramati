### Hibernate

Hibernate is a Java framework that simplifies the development of Java application to interact with the database. It is an open source, lightweight, ORM (Object Relational Mapping) tool. Hibernate implements the specifications of JPA (Java Persistence API) for data persistence.

#### ORM Tool
An ORM tool simplifies the data creation, data manipulation and data access. It is a programming technique that maps the object to the data stored in the database.
The ORM tool internally uses the JDBC API to interact with the database.

#### Advantages of Hibernate Framework

1. Open Source and Lightweight

2. Fast Performance

3. Database Independent Query

4. Automatic Table Creation

5. Simplifies Complex Join

6. Provides Query Statistics and Database Status

#### Architecture

The Hibernate architecture includes many objects such as persistent object, session factory, transaction factory, connection factory, session, transaction etc.


The Hibernate architecture is categorized in four layers.

- Java application layer
- Hibernate framework layer
- Backhand api layer
- Database layer

##### Configuration:

Configuration is a class which is present in org.hibernate.cfg package. It activates Hibernate framework. It reads both configuration file and mapping files.
It activate Hibernate Framework
Configuration cfg=new Configuration();
It read both cfg file and mapping files
> cfg.configure();

It checks whether the config file is syntactically correct or not.
If the config file is not valid then it will throw an exception. If it is valid then it creates a meta-data in memory and returns the meta-data to object to represent the config file.

##### SessionFactory:

SessionFactory is an Interface which is present in org.hibernate package and it is used to create Session Object.
It is immutable and thread-safe in nature.
buildSessionFactory() method gathers the meta-data which is in the cfg Object. 
From cfg object it takes the JDBC information and create a JDBC Connection.
> SessionFactory factory=cfg.buildSessionFactory();

##### Session:

Session is an interface which is present in org.hibernate package. Session object is created based upon SessionFactory object i.e. factory.
It opens the Connection/Session with Database software through Hibernate Framework.
It is a light-weight object and it is not thread-safe.
Session object is used to perform CRUD operations.
> Session session=factory.buildSession();

##### Transaction:

Transaction object is used whenever we perform any operation and based upon that operation there is some change in database.
Transaction object is used to give the instruction to the database to make the changes that happen because of operation as a permanent by using commit() method.
> Transaction tx=session.beginTransaction();
> tx.commit();

##### Query:

Query is an interface that present inside org.hibernate package.
A Query instance is obtained by calling Session.createQuery().
This interface exposes some extra functionality beyond that provided by Session.iterate() and Session.find():
A particular page of the result set may be selected by calling setMaxResults(), setFirstResult().
Named query parameters may be used.
> Query query=session.createQuery();

##### Criteria:

Criteria is a simplified API for retrieving entities by composing Criterion objects.
The Session is a factory for Criteria. Criterion instances are usually obtained via the factory methods on Restrictions.
> Criteria criteria=session.createCriteria();

#### Creating Hibernate Application
For creating the hibernate application, we need to follow the following steps:

1. Create the Persistent class
2. Create the mapping file for Persistent class
3. Create the Configuration file
4. Create the class that retrieves or stores the persistent object
5. Load the jar file
Run the hibernate application

##### 1. Create the Persistent class
A simple Persistent class should follow some rules:

- A no-arg constructor: It is recommended that you have a default constructor at least package visibility so that hibernate can create the instance of the Persistent class by newInstance() method.
- Provide an identifier property: It is better to assign an attribute as id. This attribute behaves as a primary key in database.
- Declare getter and setter methods: The Hibernate recognizes the method by getter and setter method names by default.
- Prefer non-final class: Hibernate uses the concept of proxies, that depends on the persistent class. The application programmer will not be able to use proxies for lazy association fetching.

##### 2) Create the mapping file for Persistent class
The mapping file name conventionally, should be class_name.hbm.xml. There are many elements of the mapping file.

- hibernate-mapping : It is the root element in the mapping file that contains all the mapping elements.
- class : It is the sub-element of the hibernate-mapping element. It specifies the Persistent class.
- id : It is the subelement of class. It specifies the primary key attribute in the class.
- generator : It is the sub-element of id. It is used to generate the primary key. There are many generator classes such as assigned, increment, hilo, sequence, native etc. We will learn all the generator classes later.
- property : It is the sub-element of class that specifies the property name of the Persistent class.

##### 3) Create the Configuration file
The configuration file contains information about the database and mapping file. Conventionally, its name should be hibernate.cfg.xml .

##### 4) Create the class that retrieves or stores the object
In this class, we are simply storing the employee object to the database. //StoreData.java

##### 5) Load the jar file
For successfully running the hibernate application, you should have the hibernate5.jar file.

##### Run the App
To run the hibernate application

- Load the jar files for hibernate. (One of the way to load the jar file is copy all the jar files under the JRE/lib/ext folder). It is better to put these jar files inside the public and private JRE both.
> Now, run the StoreData class by java com.javatpoint.mypackage.StoreData
