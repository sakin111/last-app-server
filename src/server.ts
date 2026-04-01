import { Server } from 'http'
import { initSocket } from './app/Socket';
import { envVar } from './app/config/envVar'
import { seedAdmin } from './app/shared/seedAdmin'
import { app } from './app'
import prisma from './app/shared/prisma'

import { startTravelCleanupJob, startTravelExpireJob } from './app/modules/travel/travel.service'
import { connectRedis } from './app/shared/redis';










export let server: Server

const StartServer = async () =>{
    try {
        await prisma.$connect()
        console.log("connected to DB")
        await connectRedis();
        server = app.listen(envVar.PORT, () => {
            console.log(`server is running on the port ${envVar.PORT}` )
            initSocket();
        })

    } catch (error) {
        console.log(error)
    }
}

(async() =>{
   await StartServer()
   await seedAdmin()
  startTravelExpireJob();   
  startTravelCleanupJob();
})()

process.on("SIGTERM", (err) => {
    console.log("sigterm  detected, shutting down the server...." ,err)
    if (server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on("unhandledRejection", (err) => {
    console.log("unhandledRejection is detected, shutting down the server" ,err)
    if (server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on("uncaughtException", (err) => {
    console.log("uncaughtException is detected, shutting down the server" ,err)
    if (server){
        server.close(() =>{
            process.exit(1)
        })
    }
    process.exit(1)
})



