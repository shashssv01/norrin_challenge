# Running Norrin Enterprise AI with Docker

This application has been fully containerized using Docker, allowing you to easily run the Next.js frontend and FastAPI backend together on any machine (like a Mac or PC) without manually installing Node.js or Python.

## Prerequisites

1. Install **Docker Desktop** on your machine.
2. Ensure you have your `GEMINI_API_KEY`.

## Getting Started

1. **Open your terminal** and navigate to the root directory of this project (where the `docker-compose.yml` file is located).

2. **Run the following command** to build and start both the frontend and backend servers. Be sure to replace `YOUR_API_KEY_HERE` with your actual Gemini API key:

   ```bash
   # On Mac / Linux:
   GEMINI_API_KEY="YOUR_API_KEY_HERE" docker-compose up --build

   # On Windows (PowerShell):
   $env:GEMINI_API_KEY="YOUR_API_KEY_HERE"; docker-compose up --build
   ```

3. **Wait for the build to finish**. Docker will pull the necessary Python and Node.js images, install all dependencies, and compile the Next.js production build.

4. **Access the Application**:
   - The application will be running exactly as it did locally.
   - Open your browser and go to: [http://localhost:3000](http://localhost:3000)
   - You will see the Login page. Click "Sign In" to be taken to your Dashboard.

## Stopping the Server

To stop the servers, you can simply press `Ctrl + C` in your terminal. 

If you ran it in detached mode (`-d`), you can stop it using:
```bash
docker-compose down
```

## Troubleshooting

- **"Module not found" or compilation errors**: If you make changes to the code, you must rebuild the container images by adding the `--build` flag again: `docker-compose up --build`.
- **Backend API failing**: Ensure your `GEMINI_API_KEY` is properly injected. You can also create a `.env` file in the root directory containing `GEMINI_API_KEY=your_key` and Docker Compose will automatically read it.
