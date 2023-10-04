const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = 3000;

// Middleware to fetch and analyze data from the third-party blog API
app.use('/api/blog-stats', async (req, res, next) => {
  try {
    // Replace with the actual API URL
    const API_URL = 'YOUR_CURL_REQUEST_URL';

    // Make the request to fetch the blog data
    const blogApiResponse = await axios.get(API_URL);
    const blogData = blogApiResponse.data; // Assuming the API response is JSON

    // Data analysis using Lodash
    const totalBlogs = blogData.length;
    const longestTitleBlog = _.maxBy(blogData, 'title.length');
    const blogsWithPrivacy = _.filter(blogData, (blog) =>
      _.includes(_.toLower(blog.title), 'privacy')
    );
    const uniqueBlogTitles = _.uniqBy(blogData, 'title');

    // Attach the analysis results to the response object
    res.locals.blogStats = {
      totalBlogs,
      longestTitle: longestTitleBlog.title,
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
    };

    // Continue with the next middleware/route
    next();
  } catch (error) {
    // Handle errors here
    console.error('Error fetching or analyzing blog data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to provide the blog statistics
app.get('/api/blog-stats', (req, res) => {
  // Retrieve the analysis results from res.locals and send them as JSON
  const { blogStats } = res.locals;
  res.json(blogStats);
});

// Create a blog search endpoint
app.get('/api/blog-search', (req, res) => {
  const query = req.query.query.toLowerCase(); // Convert the query to lowercase for case-insensitive search

  // Filter blogs based on the query string
  const matchingBlogs = _.filter(blogData, (blog) =>
    _.includes(_.toLower(blog.title), query)
  );

  res.json(matchingBlogs);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
