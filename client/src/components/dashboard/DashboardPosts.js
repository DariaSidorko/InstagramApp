
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import DashboardPostItem from './DashboardPostItem'

class DashboardPosts extends Component {
  render() {

    const { posts } = this.props;
    const user = this.props.auth;

    return (
      <div>
      <ul className="nav nav-tabs" id="myTab" role="tablist">
      <li className="nav-item">
        <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Posts</a>
      </li>
      <li className="nav-item">
        <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Bookmarks</a>
      </li>
    </ul>
    <div className="tab-content" id="myTabContent">
      <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
        {posts.filter(post => post.user === user.user.id).map(post => <DashboardPostItem key={post._id} post={post} />)}
      </div>
      <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
        {posts.filter(post => post.bookmarks.filter(bookmark => bookmark.user === user.user.id).length > 0).map(post => <DashboardPostItem key={post._id} post={post} />) }
      </div>
    </div>
    </div>

    )
  }
}

DashboardPosts.propTypes = {
  posts: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default  connect(mapStateToProps, {})(DashboardPosts);




















//posts.map(post => <DashboardPostItem key={post._id} post={post} />);
//(<div></div>)

//console.log("Posts are here: ", posts)
//console.log(typeof posts)