# **Sbux Support App**

## **Table of Contents**
1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
   - [1. Backend Setup](#1-backend-setup)
   - [2. Frontend Setup](#2-frontend-setup)
4. [Running the Backend](#Running-the-Backend)
5. [Running the Frontend](#running-the-frontend)
6. [Troubleshooting](#troubleshooting)

---

## **Introduction**
The `Sbux Support App` is a productivity-focused application designed to streamline daily workflows for Starbucks baristas and support partners. It offers features like product preparation tracking, task scheduling, and quick access to reference materials using `Widgets.` 
The app consists of a React Native-based frontend and a .NET Core backend, providing a seamless and efficient user experience.
This guide explains how to clone, set up, and run the project on a MacOS environment for both the front end and back end.

---

## **Features**

* Search for products and view their shelf life

* Real-time shelf life management

* View shelf life by date ranges



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

# Backend Configuration

This app connects to a private backend server for product shelf life management. The server is pre-configured for internal use and is not publicly accessible.

If you would like to set up your own backend, you can use the backend repository (if shared) and configure the `BASE_URL` in the `.env` file.


#### **Step 1: Clone the repository**
Clone the backend repository to your local machine:
```bash
git clone https://github.com/Gemnnn/sbux-support-backend.git
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
cd server
```

* Ensure the SQL Server Docker container is running

```bash
dotnet run
```

The backend should now be running at http://localhost:5223 (or the URL specified in your environment variables).

### ** Running the Frontend (on MAC)

#### IOS

Start the Metro bundler:

```bash
npx expo start --dev-client
```

(if you want to create your own bundle, try to create a bundle file like below.)

```bash
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios
```

It would be better if you changed your Xcode to Release Mode in your Scheme.


#### Android

* In preparation for implementation



### **Troubleshooting**
#### **Common Issues**

1. **Frontend Failing to Start**
   - Ensure all dependencies are installed by running:
     ```bash
     npm install
     ```
   - Confirm that the `BASE_URL` in `app.json` matches the backend URL.
   - Clear the React Native cache:
     ```bash
     npx react-native-clean-project
     ```
   - Restart the Metro bundler:
     ```bash
     npx expo start --dev-client
     ```

2. **Xcode Errors**
   - Ensure all pods are installed:
     ```bash
     cd ios && pod install
     ```
   - Clean the Xcode build folder:
     ```bash
     Product -> Clean Build Folder
     ```
   - Switch the build scheme to `Release` mode.


---

### **Contributing**

We welcome contributions to the `Sbux Support App`. To contribute:

1. **Fork the Repository**
   - Click the `Fork` button at the top-right corner of the repository page on GitHub.

2. **Clone the Forked Repository**
   - Clone the repository to your local machine:
     ```bash
     git clone https://github.com/Gemnnn/sbux-support-frontend.git
     ```

3. **Create a New Branch**
   - Create a branch for your feature or bug fix:
     ```bash
     git checkout -b feature-name
     ```

4. **Make Changes**
   - Make the necessary code changes or additions.
   - Ensure that your changes follow the project's coding standards and best practices.

5. **Commit Your Changes**
   - Write clear and descriptive commit messages:
     ```bash
     git commit -m "Add a brief description of your changes"
     ```

6. **Push Your Changes**
   - Push your branch to your forked repository:
     ```bash
     git push origin feature-name
     ```

7. **Submit a Pull Request**
   - Go to the original repository on GitHub.
   - Click `New Pull Request` and select your branch.
   - Provide a detailed explanation of the changes you made.

---

### **License**

This project is licensed under the [MIT License](LICENSE). Please review the license terms before using or contributing to the project.

---



### **Contact**

For inquiries, feedback, or support, please contact us at:
- **Email:** brandenmin.dev@gmail.com

