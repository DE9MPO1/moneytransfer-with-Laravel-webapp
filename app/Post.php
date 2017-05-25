<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    //
    protected $fillable = array('url', 'title', 'description', 'content', 'image', 'blog', 'category_id','author_id');

    public function tags() {
        return $this->belongsToMany('App\BlogTag','blog_post_tags','post_id','tag_id');
    }
    public function comments(){
        return $this->hasMany('App\Comments','on_post');
    }
  // returns the instance of the user who is author of that post
    public function author(){
        return $this->belongsTo('App\User','author_id');
    }
}
