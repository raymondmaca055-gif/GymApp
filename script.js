require('dotenv').config();
const mongoose = require('mongoose');
// Import the models we created in models.js
const { Member, Trainer, Booking } = require('./models');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('🚀 Connected to MongoDB Atlas successfully!');

    // Run our database tests inside a clean try/catch block
    try {
        // ==========================================
        // 1. CREATE (Insert Data)
        // ==========================================
        const newMember = await Member.create({
            name: "Alice Walker",
            email: "alice@gym.com",
            membershipType: "Premium"
        });
        console.log(`✅ Successfully inserted member: ${newMember.name}`);

        // ==========================================
        // 2. READ (Find Data)
        // ==========================================
        // Find ALL premium members
        const premiumMembers = await Member.find({ membershipType: "Premium" });
        console.log('\n--- Premium Gym Members ---');
        console.log(premiumMembers);

        // Find ONE specific member by their email
        const singleMember = await Member.findOne({ email: "alice@gym.com" });
        console.log(`\n🔍 Found single member: ${singleMember.name}`);

        // ==========================================
        // 3. UPDATE (Modify Data)
        // ==========================================
        // Change Alice's membershipType to VIP
        const updatedMember = await Member.findOneAndUpdate(
            { email: "alice@gym.com" }, 
            { membershipType: "VIP" },
            { new: true } // This option returns the updated document back to us
        );
        console.log(`\n🆙 Updated ${updatedMember.name}'s tier to: ${updatedMember.membershipType}`);

        // ==========================================
        // 4. DELETE (Remove Data)
        // ==========================================
        // If you ever need to remove a record:
        // await Member.deleteOne({ email: "alice@gym.com" });
        // console.log("🗑️ Member removed.");

    } catch (error) {
        console.error('❌ Database operation error:', error.message);
    } finally {
        // Optional: Close the connection when the script finishes its work
        mongoose.connection.close();
        console.log('\n🔒 Connection safely closed.');
    }
  })
  .catch(err => console.error('Database connection error:', err));
