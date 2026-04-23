# Data Migration Scripts

This directory contains scripts for managing data migration to Firestore.

## Migration Script

### `migrateData.ts`

Migrates initial data from `src/data.ts` to Firestore collections.

**What it does:**
- Migrates all designs to the `designs` collection
- Migrates all cinematic images to the `cinematics` collection
- Migrates all courses to the `courses` collection
- Adds `videoUrl` field to courses (initially empty string)
- Uses Firestore batch writes for efficient bulk operations
- Includes comprehensive error handling and logging

**Prerequisites:**
1. Firebase project created with Firestore enabled
2. Environment variables configured in `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

**Usage:**

```bash
# Run the migration script
npm run migrate
```

**Output:**
The script provides detailed console output showing:
- Initialization status
- Number of items being migrated per collection
- Progress updates
- Success/failure status
- Summary of migrated items

**Important Notes:**
- This script uses batch writes, which are limited to 500 operations per batch
- The script will fail if you try to migrate more than 500 items total
- For larger datasets, you'll need to split the migration into multiple batches
- The script uses document IDs from the source data to maintain consistency
- Running the script multiple times will overwrite existing documents with the same IDs

**Error Handling:**
The script includes helpful error messages for common issues:
- Missing environment variables
- Permission denied errors (check Firestore security rules)
- Database not found errors
- Batch operation limit exceeded

**Security Considerations:**
- You may need to temporarily adjust Firestore security rules to allow writes during migration
- After migration, ensure your security rules are properly configured for production use
- Never commit your `.env` file with real credentials to version control
