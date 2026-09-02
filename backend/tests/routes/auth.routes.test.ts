import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import app from '../../src/app';
import authService from '../../src/services/auth.service';
import AppError from '../../src/utils/Errors';

describe('POST /api/auth/signup', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 201 and sets an httpOnly cookie on success', async () => {
        sinon.stub(authService, 'signup').resolves({
            token: 'jwt-token',
            user: { id: '1', name: 'Sara', email: 'sara@gmail.com' },
        });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Sara', email: 'sara@gmail.com', password: 'password123' });

        expect(res.status).to.equal(201);
        expect(res.body.data.user.email).to.equal('sara@gmail.com');
        expect(res.body.data).to.not.have.property('token');
        expect(res.headers['set-cookie'][0]).to.include('token=');
        expect(res.headers['set-cookie'][0]).to.include('HttpOnly');
    });

    it('returns 400 when the password is too short', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Sara', email: 'sara@gmail.com', password: '123' });

        expect(res.status).to.equal(400);
        expect(res.body.message.code).to.equal('VALIDATION_ERROR');
    });

    it('returns 400 when the email is not a real email', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Sara', email: 'not-an-email', password: 'password123' });

        expect(res.status).to.equal(400);
    });

    it('returns 400 when the service says the email is already taken', async () => {
        sinon.stub(authService, 'signup').rejects(new AppError('User with this email already exists', 400, 'USER_ALREADY_EXISTS'));

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'Sara', email: 'sara@gmail.com', password: 'password123' });

        expect(res.status).to.equal(400);
        expect(res.body.message.code).to.equal('USER_ALREADY_EXISTS');
    });

});

describe('POST /api/auth/login', () => {

    afterEach(() => {
        sinon.restore();
    });

    it('returns 200 and sets a cookie on valid login', async () => {
        sinon.stub(authService, 'login').resolves({
            token: 'jwt-token',
            user: { id: '1', name: 'Sara', email: 'sara@gmail.com' },
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'sara@gmail.com', password: 'password123' });

        expect(res.status).to.equal(200);
        expect(res.headers['set-cookie'][0]).to.include('token=');
    });

    it('returns 401 when the credentials are wrong', async () => {
        sinon.stub(authService, 'login').rejects(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'sara@gmail.com', password: 'wrongpass' });

        expect(res.status).to.equal(401);
        expect(res.body.message.code).to.equal('INVALID_CREDENTIALS');
    });

    it('returns 400 when email is missing entirely', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).to.equal(400);
    });

});

describe('POST /api/auth/logout', () => {

    it('clears the cookie and returns 200', async () => {
        const res = await request(app).post('/api/auth/logout');

        expect(res.status).to.equal(200);
        expect(res.headers['set-cookie'][0]).to.include('token=;');
    });

});

describe('GET /api/auth/me', () => {

    it('returns 401 with NO_TOKEN_PROVIDED when there is no cookie', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).to.equal(401);
        expect(res.body.message.code).to.equal('NO_TOKEN_PROVIDED');
    });

    it('returns 401 with INVALID_TOKEN when the cookie is garbage', async () => {
        const res = await request(app).get('/api/auth/me').set('Cookie', ['token=not-a-real-token']);

        expect(res.status).to.equal(401);
        expect(res.body.message.code).to.equal('INVALID_TOKEN');
    });

});