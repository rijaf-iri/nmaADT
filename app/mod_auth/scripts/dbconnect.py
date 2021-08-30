import pymysql
import config

def connection():
    conn = pymysql.connect(
            host = config.MYSQL_DATABASE_HOST,
            user = config.MYSQL_DATABASE_USER,
            passwd = config.MYSQL_DATABASE_PASSWORD,
            db = config.MYSQL_DATABASE_DB
        )
    cursor = conn.cursor()
    return cursor, conn
