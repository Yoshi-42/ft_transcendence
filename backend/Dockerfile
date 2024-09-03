
FROM python:3.9

ENV PYTHONUNBUFFERED 1
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install postgresql-client
RUN apt-get update && apt-get install -y postgresql-client

# Copy project files
COPY . .

# Copy wait-for-it script and make it executable
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh



# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
