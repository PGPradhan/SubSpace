const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for fetching and analyzing data
app.use('/api/blog-stats', async (req, res, next) => {
  try {
    // cURL request information
    const CURL_API_URL = 'https://intent-kit-16.hasura.app/api/rest/blogs';
    const CURL_API_SECRET = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

    // Make the request to fetch the blog data using cURL info
    const blogApiResponse = await axios.get(CURL_API_URL, {
      headers: {
        'x-hasura-admin-secret': CURL_API_SECRET,
      },
    });

    const blogData = blogApiResponse.data; // Assuming the API response is an array of objects

    // Check if the response is an array, if not, convert it to an array
    const blogDataArray = Array.isArray(blogData) ? blogData : [blogData];

    // Data analysis using Lodash
    const totalBlogs = blogDataArray.length;
    const longestTitleBlog = _.maxBy(blogDataArray, (blog) => blog.title ? blog.title.length : 0);
    const blogsWithPrivacy = _.filter(blogDataArray, (blog) =>
      _.includes(_.toLower(blog.title || ''), 'privacy')
    );
    const uniqueBlogTitles = _.uniqBy(blogDataArray, 'title');

    // Attach the analysis results to the response object
    res.locals.blogStats = {
      totalBlogs,
      longestTitle: longestTitleBlog ? longestTitleBlog.title : '',
      blogsWithPrivacy: blogsWithPrivacy.length,
      uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title || ''),
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
  // Check if blogStats exists before accessing it
  const blogStats = res.locals.blogStats || {};

  // Retrieve the analysis results and send them as JSON
  res.json(blogStats);
});

// Create a blog search endpoint
app.get('/api/blog-search', (req, res) => {
  const query = req.query.query.toLowerCase(); // Convert the query to lowercase for case-insensitive search

  // Check if uniqueBlogTitles exists before accessing it
  const uniqueBlogTitles = res.locals.blogStats ? res.locals.blogStats.uniqueBlogTitles : [];

  // Filter blogs based on the query string
  const matchingBlogs = _.filter(uniqueBlogTitles, (title) =>
    _.includes(_.toLower(title || ''), query)
  );

  res.json(matchingBlogs);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
