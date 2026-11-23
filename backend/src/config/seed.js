const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedDemoUsers = async () => {
  try {
    const studentEmail = 'student.demo@ascend.ai';
    const recruiterEmail = 'recruiter.demo@ascend.ai';
    const defaultPassword = 'AscendDemo2026!';

    // 1. Seed or Verify Student Demo Account
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      student = await User.create({
        name: 'Jasleen Kaur (Student)',
        email: studentEmail,
        password: hashedPassword,
        role: 'jobseeker',
        headline: 'Computer Science & AI Specialist',
        targetRole: 'Data Scientist',
        skills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'React', 'Node.js', 'SQL'],
        profileCompleted: true
      });
      console.log('✓ Seeded demo student account: student.demo@ascend.ai');
    } else {
      // Ensure password hash matches defaultPassword in case of outdated hash
      const isPasswordValid = await bcrypt.compare(defaultPassword, student.password);
      if (!isPasswordValid) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(defaultPassword, salt);
        await student.save();
        console.log('✓ Re-synced password for student.demo@ascend.ai');
      }
    }

    // 2. Seed or Verify Recruiter Demo Account
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      recruiter = await User.create({
        name: 'Campus Recruiting Lead',
        email: recruiterEmail,
        password: hashedPassword,
        role: 'recruiter',
        headline: 'Senior Technical Talent Acquisition Partner',
        targetRole: 'Recruiter',
        skills: ['Technical Screening', 'Candidate Assessment', 'ATS Optimization'],
        profileCompleted: true
      });
      console.log('✓ Seeded demo recruiter account: recruiter.demo@ascend.ai');
    } else {
      // Ensure password hash matches defaultPassword in case of outdated hash
      const isPasswordValid = await bcrypt.compare(defaultPassword, recruiter.password);
      if (!isPasswordValid) {
        const salt = await bcrypt.genSalt(10);
        recruiter.password = await bcrypt.hash(defaultPassword, salt);
        await recruiter.save();
        console.log('✓ Re-synced password for recruiter.demo@ascend.ai');
      }
    }
  } catch (err) {
    console.warn('Demo user seeding notice:', err.message);
  }
};

module.exports = { seedDemoUsers };
