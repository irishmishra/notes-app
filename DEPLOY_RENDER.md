Render deployment steps

1. Push your project to a Git provider (GitHub/GitLab).
2. In Render dashboard, create a new Web Service and connect your repository.
   - If you want Render to build the Docker image, select "Docker" (it will use `Dockerfile`).
3. In the service settings, add the required environment variables:
   - `MONGODB_URI` -> your MongoDB connection string
   - `JWT_SECRET` -> secret for JWT signing
4. Deploy. Render will build and start the container.

Local Docker test

```bash
docker build -t notes-app .
docker run -e MONGO_URI="your_mongo_uri" -e JWT_SECRET="s3cr3t" -p 3000:3000 notes-app
```
