import os


def build_postgresql_database_url() -> str:
    """Postgresqlへ接続するurlをenvから組み立てる処理

    Returns:
      str: DATABASE_URL

    Raises:
      RuntimeError: "Unsupported DB_CONNECTION: {db_connection}"
    """
    db_user = os.getenv("DB_USERNAME", "app")
    db_password = os.getenv("DB_PASSWORD", "app")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_DATABASE", "app")
    db_connection = os.getenv("DB_CONNECTION", "pgsql")

    if db_connection != "pgsql":
        raise RuntimeError(f"Unsupported DB_CONNECTION: {db_connection}")

    return f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
