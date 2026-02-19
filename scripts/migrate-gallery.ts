/**
 * Migration script: Convert Service.photoURL (string) to Service.gallery (string[])
 *
 * Run with: npx tsx scripts/migrate-gallery.ts
 */
import { MongoClient } from "mongodb"
import * as dotenv from "dotenv"

dotenv.config()

async function migrate() {
  const uri = process.env.DATABASE_URL
  if (!uri) {
    throw new Error("DATABASE_URL not set")
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("denik")
    const services = db.collection("Service")

    // Find all services that have photoURL but not gallery
    const servicesWithPhotoURL = await services.find({
      photoURL: { $exists: true },
    }).toArray()

    console.log(`Found ${servicesWithPhotoURL.length} services with photoURL`)

    for (const service of servicesWithPhotoURL) {
      const gallery = service.photoURL ? [service.photoURL] : []

      await services.updateOne(
        { _id: service._id },
        {
          $set: { gallery },
          $unset: { photoURL: "" }
        }
      )

      console.log(`Migrated service ${service._id}: ${service.name}`)
    }

    // Also ensure services without photoURL have an empty gallery array
    const result = await services.updateMany(
      { gallery: { $exists: false } },
      { $set: { gallery: [] } }
    )

    console.log(`Set empty gallery for ${result.modifiedCount} additional services`)
    console.log("Migration complete!")

  } finally {
    await client.close()
  }
}

migrate().catch(console.error)
