var sum_to_n_a = function(n) {
    (n* (n+1))/2;
};

var sum_to_n_b = function(n) {
    var sum = 0;
    for (var i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_c = function(n) {
    return n === 1 ? 1 : n + sum_to_n_c(n - 1);
};
