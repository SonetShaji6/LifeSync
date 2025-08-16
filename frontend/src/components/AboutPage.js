import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const navigate = useNavigate();

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2, // Stagger child animations
      },
    },
  };

  const titleVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 120,
      },
    },
  };

  const textVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const featureListVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.4, // Delay the list animation slightly
        staggerChildren: 0.1, // Stagger list item animations
      },
    },
  };

  const featureItemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.3, yoyo: Infinity },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-r from-purple-600 to-orange-400 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <br />
      <div className="flex flex-row-reverse">
        <motion.button
          className="py-2 px-4 bg-gradient-to-r from-purple-500 to-orange-400 rounded-lg text-lg font-semibold shadow hover:opacity-90"
          onClick={() => navigate('/login')}
          variants={buttonVariants}
          whileHover="hover"
        >
          Login/Signup
        </motion.button>
      </div>
      <motion.div
        className="max-w-5xl mx-auto py-16 px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl font-bold mb-6"
          variants={titleVariants}
        >
          Welcome to <span className="text-orange-300">LifeSync</span>
        </motion.h1>
        <motion.p
          className="text-xl leading-8 mb-8"
          variants={textVariants}
        >
          LifeSync is a comprehensive platform designed to help individuals and
          families organize, collaborate, and thrive in a fast-paced world. Our
          mission is to simplify your life by providing tools that enhance
          productivity, foster connections, and ensure your well-being.
        </motion.p>
        <motion.div
          className="bg-white text-gray-800 rounded-3xl shadow-lg py-8 px-6"
          variants={featureListVariants}
        >
          <motion.h2
            className="text-3xl font-bold text-purple-600 mb-4"
            variants={titleVariants}
          >
            Key Features of LifeSync
          </motion.h2>
          <motion.ul className="space-y-4 text-left text-lg leading-7">
            <motion.li variants={featureItemVariants}>
              <span className="text-orange-500 font-bold">Shared Storage:</span>{' '}
              Securely store important files and documents for individuals or
              families with password protection.
            </motion.li>
            <motion.li variants={featureItemVariants}>
              <span className="text-orange-500 font-bold">Task Planning:</span>{' '}
              Plan work or study schedules by aligning tasks with available
              time.
            </motion.li>
            <motion.li variants={featureItemVariants}>
              <span className="text-orange-500 font-bold">
                Health Management:
              </span>{' '}
              Maintain medical records, track prescribed medicines, and get
              personalized health recommendations.
            </motion.li>
            <motion.li variants={featureItemVariants}>
              <span className="text-orange-500 font-bold">
                Self-Improvement:
              </span>{' '}
              Build habits with reading, courses, and personal growth tasks.
            </motion.li>
            <motion.li variants={featureItemVariants}>
              <span className="text-orange-500 font-bold">Reminders:</span>{' '}
              Never miss appointments, special dates, or bill dues with smart
              reminders.
            </motion.li>
          </motion.ul>
        </motion.div>
        <motion.p
          className="text-xl mt-10 leading-8"
          variants={textVariants}
        >
          LifeSync is built with the idea of connecting and empowering people
          while making everyday life simpler and more organized. Join us to
          experience the future of personal and family management!
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default AboutPage;