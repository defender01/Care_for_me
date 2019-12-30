module.exports = {
  checkAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource')
    res.redirect('/auth/login');
  },
  checkNotAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    req.flash('success_msg', 'You are logged in')
    res.redirect('/data/collection');      
  }
};
