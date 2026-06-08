import { BeforeAll, AfterAll, Before } from '@cucumber/cucumber'
import { createApp } from '../../src/app'
import { PrismaClient } from '@prisma/client'
import { Server } from 'http'

let server: Server
const prisma = new PrismaClient()

BeforeAll(async () => {
  const app = createApp()
  // Levantar el servidor en el puerto 3001 (que es el puerto que usa Axios por defecto)
  server = app.listen(3001)
})

AfterAll(async () => {
  await prisma.$disconnect()
  if (server) {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
})

Before(async () => {
  // Limpiar la base de datos antes de cada escenario para evitar fugas de estado
  await prisma.statusHistory.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
})
