# Smart Task Manager

## Overview
This project is a small task management system built with Flask (backend) and React (frontend).  
Users can create, view, complete, and delete tasks.

## Tech Stack

Backend
- Python
- Flask
- SQLAlchemy
- Marshmallow

Frontend
- React
- Axios

Database
- SQLite

## Architecture

React Frontend
↓
API Service Layer (Axios)
↓
Flask REST API
↓
Service Layer
↓
SQLAlchemy Models
↓
SQLite Database

## API Endpoints

POST /tasks  
GET /tasks  
GET /tasks/{id}  
PUT /tasks/{id}  
PATCH /tasks/{id}/complete  
DELETE /tasks/{id}

## Running the Project

Backend

cd backend  
venv\Scripts\activate  
python app.py

Frontend

cd frontend  
npm install  
npm start

## AI Usage

AI tools were used to:
- scaffold the Flask backend structure
- generate React components
- design API service layer
- review architecture decisions

All generated code was manually reviewed and adjusted to ensure correctness and maintainability.