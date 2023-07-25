require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use(express.json());

const User = require('./models/User');

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'teste' });
});

app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id, '-password');

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não localizado' });
    }

    res.status(200).json({ user });
});

function checkToken(req, res, next) {
    const authHeader = req.headers['authorizations'];

    const token = authHeader && authHeader.split('')[1];

    if (!token) {
        return res.status(401).json({ msg: 'Acesso Negado' });
    }

    try {
        const secret = process.env.SECRET;

        jwt.verify(token, secret);

        next();
    } catch (error) {
        res.status(400).json({ msg: 'Token inválido' });
    }
}

app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name) {
        return res.status(422).json({ msg: 'Nome obrigatório' });
    }

    if (!email) {
        return res.status(422).json({ msg: 'E-mail obrigatório' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'Senha obrigatória' });
    }

    if (password != confirmPassword) {
        return res.status(422).json({ msg: 'Senhas não conferem' });
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
        return res.status(422).json({ msg: 'Utilize outro e-mail' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        email,
        password: passwordHash,
    });

    try {
        await user.save();
        res.status(201).json({ msg: 'Usuário criado com sucesso' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro no servidor, tente novamente' });
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ msg: 'E-mail obrigatório' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'Senha obrigatória' });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(422).json({ msg: 'Usuário não encontrado' });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.status(422).json({ msg: 'Senha inválida' });
    }

    try {
        const secret = process.env.SECRET;

        const token = jwt.sign(
            {
                id: user._id,
            },
            secret
        );
        res.status(200).json({
            msg: 'Autenticação realizada com sucesso',
            token,
        });
    } catch (err) {
        console.log(error);

        res.status(500).json({
            msg: 'Aconteceu um erro no servidor, tente novamente',
        });
    }
});

app.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(422).json({ msg: 'E-mail obrigatório' });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
      return res.status(422).json({ msg: 'Usuário não encontrado' });
  }

  try {
      const secret = process.env.SECRET;
      const token = jwt.sign(
          {
              id: user._id,
          },
          secret,
          { expiresIn: '1h' }
      );

      let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
          }
      });

      let info = await transporter.sendMail({
          from: '"Estudo Login" <ribasvasconcelos.wr@gmail.com>',
          to: email,
          subject: 'Redefinição de Senha',
          text: `Olá, ${user.name}! Para redefinir sua senha, acesse o link a seguir: http://meusistema.com/reset-password?token=${token}`,
          html: `<p>Olá, ${user.name}!</p><p>Para redefinir sua senha, acesse o link a seguir:</p><p><a href="http://meusistema.com/reset-password?token=${token}">Redefinir Senha</a></p>`
      });

      res.status(200).json({ msg: 'E-mail enviado com sucesso' });
  } catch (error) {
      console.log(error);
      res.status(500).json({
          msg: 'Aconteceu um erro no servidor, tente novamente',
      });
  }
});

app.post('/auth/reset-password', async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
        return res.status(422).json({ msg: 'Token obrigatório' });
    }

    if (!password) {
        return res.status(422).json({ msg: 'Senha obrigatória' });
    }

    if (password != confirmPassword) {
        return res.status(422).json({ msg: 'Senhas não conferem' });
    }

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        await User.findByIdAndUpdate(decoded.id, { password: passwordHash });

        res.status(200).json({ msg: 'Senha redefinida com sucesso' });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Aconteceu um erro no servidor, tente novamente',
        });
    }
});

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
    .connect(
        `mongodb+srv://${dbUser}:${dbPassword}@ultra.kckodiu.mongodb.net/?retryWrites=true&w=majority`
    )
    .then(() => {
        app.listen(3000);
        console.log('Conectado');
    })
    .catch((err) => console.log(err));


