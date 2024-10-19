module.exports = {
     hostname: 'myhostname',
     database: {
         host: process.env.DB_HOST || "srv1616.hstgr.io", //traido desde hostinger. para establecer la conexión remota.
         user: process.env.DB_USER || "u420603702_adminrastreoap",
         password: process.env.DB_PASSWORD || "JJ41UBlV3?6b",
         database: process.env.DB_DATABASE || "u420603702_apprastreo",
     } 
 
    /* hostname: 'localhost',
     database: {
         host: "localhost", //traido desde hostinger. para establecer la conexión remota.
         port: 3306,
         user: "root",
         password: "Lib49@pz",
         database: "APPRASTREO",
     } */
 
 }


 