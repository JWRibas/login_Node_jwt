require('dotenv').config()
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));



//json res
app.use(express.json())

const User = require('./models/User')

//rotas
app.get('/', (req, res) => {
    res.status(200).json({msg: 'teste'})
})

app.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id, '-password')

    if (!user) {
        return res.status(404).json({ msg: 'Usuário não localizado'})
    }

    res.status(200).json({ user })
})

function checkToken(req, res, next) {
    const authHeader = req.headers['authorizations']
    
    const token = authHeader && authHeader.split('')[1]

    if(!token) {
        return res.status(401).json({ msg: 'Acesso Negado'})
    }

    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()

    } catch (error) {
        res.status(400).json({msg: "Token inválido"})
    }
}

//users
app.post('/auth/register', async(req, res) => {
    const {name, email, password, confirmPassword } = req.body

    if(!name) {
        return res.status(422).json({msg: 'nome obrigatório'})
    }

    if(!email) {
        return res.status(422).json({msg: 'email obrigatório'})
    }

    if(!password) {
        return res.status(422).json({msg: 'senha obrigatório'})
    }

    if(password != confirmPassword) {
        return res.status(422).json({msg: 'senhas não conferem'})
    }

    const userExists = await User.findOne({ email: email})

    if (userExists) {
        return res.status(422).json({ msg: 'Utilize outro e-mail'})
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({msg: 'Usuário criado com Sucesso'})

    } catch(error) {
        console.log(error)
        res.status(500).json({msg: 'erro no servidor, tente novamente'})
    }
})

app.post('/auth/login', async (req, res) =>{
    const { email, password } = req.body

    if(!email) {
        return res.status(422).json({msg: 'email obrigatório'})
    }

    if(!password) {
        return res.status(422).json({msg: 'senha obrigatório'})
    }

    const user = await User.findOne({ email: email})

    if (!user) {
        return res.status(422).json({ msg: 'Usuário não encontrado'})
    }

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(422).json({ msg: 'Senha Invalida' })
    }

    try {

        const secret = process.env.SECRET

        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )
            res.status(200).json({ msg: 'Autenticação realizada com sucesso', token })
       

    } catch (err) {
        console.log(error)

        res.status(500).json( {
            msg: 'Aconteceu um erro no servidor, tente novamente'
        })
    }
})


const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose
    .connect(
        `mongodb+srv://${dbUser}:${dbPassword}@ultra.kckodiu.mongodb.net/?retryWrites=true&w=majority`
    )
    .then(() => {
        app.listen(3000)
        console.log('conectado')
    })
    .catch((err) => console.log(err))

