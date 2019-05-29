### MAVEN

Maven is a powerful project management tool that is based on POM (project object model). It is used for projects build, dependency and documentation.

Understanding the problem without Maven
There are many problems that we face during the project development. They are discussed below:

1. Adding set of Jars in each project: In case of struts, spring, hibernate frameworks, we need to add set of jar files in each project. It must include all the dependencies of jars also.

2. Creating the right project structure: We must create the right project structure in servlet, struts etc, otherwise it will not be executed.

3. Building and Deploying the project: We must have to build and deploy the project so that it may work.

#### What it does?
Maven simplifies the above mentioned problems. It does mainly following tasks.

1. It makes a project easy to build
2. It provides uniform build process (maven project can be shared by all the maven projects)
3. It provides project information (log document, cross referenced sources, mailing list, dependency list, unit test reports etc.)
4. It is easy to migrate for new features of Maven

#### Apache Maven helps to manage
1. Builds
2. Documentation
3. Reporing
4. SCMs
5. Releases
6. Distribution

#### Maven repository
A maven repository is a directory of packaged JAR file with pom.xml file. Maven searches for dependencies in the repositories. There are 3 types of maven repository:

1. Local Repository
2. Central Repository
3. Remote Repository
Maven searches for the dependencies in the following order:

Local repository then Central repository then Remote repository.

#### 1. Maven Local Repository
Maven local repository is located in your local system. It is created by the maven when you run any maven command.

#### 2. Maven Central Repository
Maven central repository is located on the web. It has been created by the apache maven community itself.

The path of central repository is: http://repo1.maven.org/maven2/.

The central repository contains a lot of common libraries that can be viewed by this url http://search.maven.org/#browse.

#### 3. Maven Remote Repository
Maven remote repository is located on the web. Most of libraries can be missing from the central repository such as JBoss library etc, so we need to define remote repository in pom.xml file.

#### Maven pom.xml file
POM is an acronym for Project Object Model. The pom.xml file contains information of project and configuration information for the maven to build the project such as dependencies, build directory, source directory, test source directory, plugin, goals etc.

Maven reads the pom.xml file, then executes the goal.

#### Build the Maven Project
The mvn package command completes the build life cycle of the maven project such as:

1. validate
2. compile
3. test
4. package
5. integration-test
6. verify
7. install
8. deploy

Need to execute the following command on the command prompt to package the maven project:

>mvn package
  
Now you will see that a jar file is created inside the project/target directory.

You can also run the maven project by the jar file. To do so, go to the maven project directory, for example: C:\Users\SSS IT\CubeGenerator and execute the following command on the cmd:
```
java -classpath target\CubeGenerator-1.0-SNAPSHOT.jar;.; com.javatpoint.App  
```