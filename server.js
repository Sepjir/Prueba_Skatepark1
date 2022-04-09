const express = require("express")
const app = express()
const exphbs = require("express-handlebars")
const expressFileUpload = require("express-fileupload")
const fs = require("fs")
const jwt = require("jsonwebtoken")
const {newSkater, getSkaters, modSkater, modEstado, deleteSkater} = require("./consultas")
const {key} = require("./jwt/key")
const port = process.env.PORT || 5000



app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(expressFileUpload({
    limits: {fileSize: 5000000},
    abortOnLimit: true,
    responseOnLimit: 'El peso del arhivo que intentar subir supera el limite permitido',
}))


app.use("/bootstrap", express.static(__dirname + "/node_modules/bootstrap/dist/css"))
app.use("/bootstrapJS", express.static(__dirname + "/node_modules/bootstrap/dist/js"))
app.use("/public", express.static(__dirname + "/public/"))

app.set("view engine", "handlebars")

app.engine("handlebars", exphbs.engine({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/components"
}))

app.get("/", async (req, res) => {
    const {id, estado} = req.query
    await modEstado(id, estado)
    const skaters = await getSkaters()
    res.render("index", {
        layout: "index",
        skaters
    })
})

app.get("/registro", (req, res) => {
    res.render("registro", {
        layout: "registro"
    })
})

app.post("/registrado", async (req, res) =>{ 
    const {email, nombre, password, password2, experiencia, especialidad} = req.body
    const {foto} = req.files
    const estado = false
    const foto2 = `${email}.jpg`
    if (password == password2) {
        foto.mv(`${__dirname}/public/imgs/${email}.jpg`)
        await newSkater(email, nombre, password, experiencia, especialidad, foto2, estado)
        res.send(`<script>alert("El usuario ha sido creado éxitosamente"); window.location.href = "/registro"</script>`)
    } else {
        res.send(`<script>alert("Las contraseñas no coinciden"); window.location.href = "/registro"</script>`)
    }
})

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "login"
    })
})


app.use("/signin", async (req, res, next) => {
    const {email, password} = req.query
    email == "admin@admin.com" && password == "123456"
        ? res.redirect("/admin")
        : next()
})

app.get("/admin", async (req, res) => {
    const skaters = await getSkaters()
    res.render("admin", {
        layout: "admin",
        skaters
    })
})

app.get("/signin", async (req, res) => {
    const {email, password} = req.query
    const skaters = await getSkaters()
    const auth = skaters.find((s) => s.email == email && s.password == password)
    
    if (auth) {
        const token = jwt.sign({
            exp: Math.floor(Date.now()/ 1000) + 300,
            data: auth
        }, key)

        res.send(`<script>alert("Email y contraseña válidos, ahora deberás actualizar tus datos"); window.location.href = "/actualizar?token=${token}"</script>`)
    } else {
        res.status(401).send(`<script>alert("Email y contraseña no válidos"); window.location.href = "/login"</script>`)
    }
})

app.get("/actualizar", (req, res) => {
    const {token} = req.query
    jwt.verify(token, key, (err, decoded) => {
        const skater = decoded.data
        err
            ? res.status(401).send({
                error: "401 Unauthorized",
                message: err.message
            })
            : res.render("actualizar", {
                layout: "actualizar",
                skater
            })
    })
})


app.post("/actualizando", async (req, res) => {
    const {nombre, password, experiencia, especialidad, email, password2} = req.body
    if (password == password2) {
        await modSkater(email, nombre, password, experiencia, especialidad)
        res.send(`<script>alert("Se han actualizado los datos"); window.location.href = "/"</script>`)
        
    }else {
        res.send(`<script>alert("Las nuevas contraseñas deben ser iguales, volviendo al Login"); window.location.href = "/login"</script>`)
    }

})

app.get("/delete", async (req, res) =>{
    const {id} = req.query
    await deleteSkater(id)
    res.send(`<script>alert("Se han eliminado los datos del Skater con id ${id}, volviendo al inicio"); window.location.href = "/"</script>`)
})




app.listen(port, () => console.log(`Servidor levantado en el puerto ${port}`))