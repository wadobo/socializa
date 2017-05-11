function addchallenge() {
    var ch = $(".orig_challenge").last().clone();
    var n = parseInt(ch.attr("n"), 10);
    n += 1;

    ch.attr("id", "challenge_"+n);
    ch.attr("n", n);
    ch.find(".n").html(n);
    ch.find(".rmchallenge").attr("n", n).removeClass("hidden");

    ch.find(".name").attr("name", "challenge_name_"+n);
    ch.find(".desc").attr("name", "challenge_desc_"+n);
    ch.find(".type").attr("name", "challenge_type_"+n);
    ch.find(".depend").attr("name", "challenge_depends_on_"+n);

    $("#challenges").append(ch);

    $(".rmchallenge").unbind("click").click(rmchallenge);
    return false;
}

function rmchallenge() {
    var n = $(this).attr("n");
    $("#challenge_"+n).remove();
    return false;
}

$(document).ready(function() {
    $("#addchallenge").click(addchallenge);
    $(".rmchallenge").unbind("click").click(rmchallenge);
});
