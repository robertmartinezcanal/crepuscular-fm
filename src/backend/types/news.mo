import Common "common";
import Principal "mo:core/Principal";

module {
  public type NewsId = Common.NewsId;
  public type Timestamp = Common.Timestamp;

  public type NewsItem = {
    id : NewsId;
    title : Text;
    body : Text;
    publishedAt : Timestamp;
    author : Principal;
  };
};
