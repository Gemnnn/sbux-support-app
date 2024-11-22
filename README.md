# **Sbux Support App**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
   - [1. Backend Setup](#1-backend-setup)
   - [2. Frontend Setup](#2-frontend-setup)
4. [Running the Backend](#running-the-backend)
5. [Running the Frontend](#running-the-frontend)
6. [Troubleshooting](#troubleshooting)

---

## **Introduction**
The `Sbux Support App` is a productivity-focused application designed to streamline daily workflows for Starbucks baristas and support partners. It offers features like product preparation tracking, task scheduling, and quick access to reference materials using `Widgets`. 
The app consists of a React Native-based frontend and a .NET Core backend, providing a seamless and efficient user experience.
This guide explains how to clone, set up, and run the project on a MacOS environment for both the frontend and backend.

---

## **Prerequisites**

**Required Tools**

Ensure the following are installed on your development machine:

**Common**

* Node.js (includes npm) - [Install Node.js](https://nodejs.org/en/)
* React Native CLI - [Install React Native CLI](https://reactnative.dev/docs/getting-started)

**For iOS**

* Xcode (for Android/iOS development) - [Download Xcode](https://developer.apple.com/xcode/)

**For Android**

* Android Studio - [Download Android Studio](https://developer.android.com/studio)

**Note:** To connect Azure Data Studio with Docker-based Visual Studio Code in a Mac environment, refer to the YouTube video: 
[How to Install SQL Server on MacOS using Docker](https://www.youtube.com/watch?v=WLZWoeutryQ). 

Currently, the database is empty by default. You'll need to insert data yourself for testing.

---

## **Project Setup**

### **1. Backend Setup**

#### **Step 1: Clone the repository**
Clone the backend repository to your local machine:
```bash
git clone https://github.com/your-repo/sbux-support-backend.git
cd sbux-support-backend
```
### **2. Restore dependencies**

#### Restore the required .NET dependencies:
```bash
dotnet restore
```
### **3. Set Up SQL Server in Docker**

#### Run the following command to start SQL Server using Docker:
```bash
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourStrongPassword' -p 1433:1433 --name azuresqledge -d mcr.microsoft.com/azure-sql-edge
```

#### Verify that the container is running:
```bash
docker ps
```

### **Step 4: Configure the Database Connection**

#### Run the following command to start SQL Server using Docker:
Open the appsettings.Development.json file and update the ConnectionStrings section:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=SbuxSupportDB;User Id=SA;Password=YourStrongPassword;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### **Step 5: Apply Database Migrations**

#### Run the following command to apply database migrations and create the database:

```bash
dotnet ef database update
```


### **2. Frontend Setup**

#### **Step 1: Clone the repository**
Clone the frontend repository to your local machine:
```bash
git clone https://github.com/your-repo/sbux-support-frontend.git
cd sbux-support-frontend
```

#### **Step 2: Install Dependencies**
Install the required dependencies using npm or yarn:

```bash
npm install
# OR
yarn install
```

#### **Step 3: Configure Environment Variables**
Add the app.json file in the root directory.
Update the extra.BASE_URL field to match your backend URL. For local development:
```bash
"extra": {
    "BASE_URL": "http://localhost:5223"
}
```

### ** Running the Backend (on MAC)

```bash
dotnet run
```

