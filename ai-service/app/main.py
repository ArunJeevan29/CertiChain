from fastapi import FastAPI

app = FastAPI(title="AI Certificate Analysis Service", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "AI Certificate Analysis Service is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
