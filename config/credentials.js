module.exports = {
   /*  hostname: 'myhostname',
     database: {
         host: process.env.DB_HOST || "srv1616.hstgr.io", //traido desde hostinger. para establecer la conexión remota.
         user: process.env.DB_USER || "u420603702_adminrastreoap",
         password: process.env.DB_PASSWORD || "JJ41UBlV3?6b",
         database: process.env.DB_DATABASE || "u420603702_apprastreo",
         waitForConnections: true
     } */
 
    hostname: 'localhost',
     database: {
         host: "localhost", // dirección para establecer la conexión
         port: 3306, // puerto donde se ejecuta el servidor  motor de base de datos
         user: "root", // usuario de login 
         password: "abscs", // contraseña asignada a la base de datos (esto segun hayas configurado tu motor de base de datos).
         database: "APPRASTREO", // nombre de la base de datos
     } 
 
 }


 