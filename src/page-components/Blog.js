/* global graphql */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'react-emotion'

import PostPreview from '../components/PostPreview'
import { mainContainer } from '../styles/layout-styles'

const Posts = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between'
})
const Section = styled('section')(...mainContainer)

class Blog extends Component {
  constructor(props) {
    super(props)
    this.state = {
      posts: []
    }
  }

  componentDidMount() {
    const { data } = this.props
    const { allContentfulBlogPost } = data
    const posts = allContentfulBlogPost.edges.map(({ node }) => node)
    this.setState({ posts })
  }

  render() {
    const { posts, next } = this.state
    return (
      <Section>
        <Posts>
          {posts.map(({ id, ...post }) => <PostPreview key={id} {...post} />)}
        </Posts>
      </Section>
    )
  }
}

Blog.propTypes = {
  data: PropTypes.shape({
    allContentfulPage: PropTypes.shape({
      title: PropTypes.string.isRequired,
      sections: PropTypes.array.isRequired
    })
  })
}

export default Blog

export const query = graphql`
  query BlogQuery {
    allContentfulBlogPost(sort: { fields: [publishDate], order: DESC }) {
      edges {
        node {
          id
          publishDate
          title
          description
          slug
          category {
            identifier
            name
          }
          tags
          hero {
            description
            title
            responsiveSizes(maxWidth: 375, quality: 70, toFormat: JPG) {
              src
              srcSet
              sizes
            }
          }
        }
      }
    }
  }
`
