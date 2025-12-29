import pytest
from app import create_app, db as _db
from app.models import Book

@pytest.fixture(scope="session")
def app():
    app = create_app("config.TestingConfig")
    with app.app_context():
        yield app

@pytest.fixture(scope="session")
def db(app):
    _db.create_all()
    yield _db
    _db.drop_all()

@pytest.fixture(scope="function")
def session(db):
    connection = db.engine.connect()
    transaction = connection.begin()

    options = {"bind": connection, "binds": {}}
    session = db._make_scoped_session(options)

    db.session = session

    yield session

    session.remove()
    transaction.rollback()
    connection.close()