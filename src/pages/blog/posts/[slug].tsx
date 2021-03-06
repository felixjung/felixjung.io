import * as React from 'react';
import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next';
import * as BlogService from 'services/BlogService';
import * as MDXService from 'services/MDXService';
import { BlogPost } from 'components/BlogPost';
import { PageProps } from 'types/page';
import * as MetaService from 'services/MetaService';
import { MetaTags } from 'components/MetaTags';

export const config = {
  unstable_runtimeJS: false,
};

enum HTTPStatusCode {
  NOT_FOUND = 404,
}

class PageError extends Error {
  msg: string;

  code: HTTPStatusCode;

  constructor(code: HTTPStatusCode, msg: string) {
    super(msg);

    this.code = code;
    this.msg = msg;
  }
}

interface PostProps extends PageProps {
  post: {
    title: string;
    category: string;
    tags: string[];
    publishDate?: string;
    summary: string;
    body: string;
  };
}

type PostParams = {
  slug: string;
};

export const getStaticProps: GetStaticProps<PostProps, PostParams> = async ({
  params = {},
}) => {
  // TODO: introduce custom errors that can be thrown and then used by the custom error page.

  const { slug } = params;

  if (!slug) {
    throw new PageError(HTTPStatusCode.NOT_FOUND, 'Page not found');
  }

  const post = await BlogService.getPost(slug);

  if (!post) {
    throw new PageError(HTTPStatusCode.NOT_FOUND, 'Page not found');
  }

  const title = MetaService.getPageTitle(post.title);
  const path = `/blog/posts/${slug}`;
  const url = MetaService.getPageURL(path);

  const parsedBodyMDX = await MDXService.parseMDX(post.body);
  const parsedTitleMDX = await MDXService.parseMDX(`# ${post.title}`);

  const publishDate =
    post.publishDate && BlogService.formatDate(post.publishDate);

  return {
    props: {
      post: {
        ...post,
        category: BlogService.formatCategory(post.category),
        publishDate,
        body: parsedBodyMDX,
        title: parsedTitleMDX,
      },
      title,
      url,
    },
  };
};

export const getStaticPaths: GetStaticPaths<PostParams> = async () => {
  const posts = await BlogService.getPosts(0, 1000);

  return {
    paths: posts.map(({ slug }) => ({ params: { slug } })),
    fallback: false,
  };
};

const Post: React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({
  url,
  title,
  post,
}) => (
  <React.Fragment>
    <MetaTags url={url} description={post.summary} title={title} />
    <BlogPost {...post} />
  </React.Fragment>
);

export default Post;
