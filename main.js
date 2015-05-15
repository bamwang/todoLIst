// Controller
var manager;
$(function() {
  manager = new Manager();
  // manager.add({
  //   title: "teest",
  //   description: "asdfasfasfasdf\nsadfas dfa  s   d as d  fas",
  //   deadline: new Date() + 40000,
  //   status: 1,
  //   priority: 4,
  //   tags: ["test", "tests"]
  // });
  // manager.add();
  // manager.add();
  // var data = manager.getAll();
  // console.log(data);
  var renderer = new Renderer(manager);
  renderer.inflate();
});

function Renderer(manager) {
  //test
  var self = this;
  var _manager = manager;
  var $container = $('#container');
  var $itemTemplate = $('#template>.item');
  var $tagTemplate = $('#template>.tag');
  this.inflate = function inflate() {
    $container.html('');
    manager.getAll().map(function(task, index) {
      var $item = $itemTemplate.clone();
      $item.attr('id', task.id);
      for (var key in task) {
        var value = task[key];
        if (key === 'deadline')
          continue;
        if(typeof value === 'string')
          value = value.replace(/\n/g,'<br>');
        $item.find('.' + key + ' p').html(value);
      }
      bind($item, task);
      $item.appendTo($container);
    });
  };
  var bind = function bind($item, task) {
    var $status = $item.find('.status');
    var $title = $item.find('.title');
    var $priority = $item.find('.priority');
    var $deadline = $item.find('.deadline');
    var $tags = $item.find('.tags');
    var $description = $item.find('.description');
    var $delete = $item.find('.delete');
    // status
    $status.find('input').prop('checked', task.status == 1)
      .on('change', function(e) {
        _manager.update(task.id, {
          status: ($(this).prop('checked')) ? 1 : 0
        });
      });

    //title
    var $titleInput = $title.find('input');
    var $titleP = $title.find('p');
    $titleInput.val(task.title)
      .on('change', function() {
        _manager.update(task.id, {
          title: $(this).val()
        });
      })
      .hide()
      .on('blur keyup', function(e) {
        if (e.type === 'keyup' && e.keyCode === 13){
          $(this).blur();
          return;
        }else if (e.type === 'keyup' && e.keyCode !== 13){
          return;
        }
        $(this).hide(0);
        $titleP.text($(this).val()).show();
      });
    $titleP.on('click', function() {
      $(this).hide(0, function() {
        $titleInput.show().focus();
      });
    });

    //priority
    $priority.find('select')
      .val(task.priority)
      .on('change', function() {
        _manager.update(task.id, {
          priority: $(this).val()
        });
      });

    //deadline
    var date = new Date(task.deadline);
    $deadline.find('input')
      .val(date.getFullYear() + '-' + ((date.getMonth()+1 < 10) ? '0' + (date.getMonth()+1) : (date.getMonth()+1)) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate()) + 'T' + ((date.getHours() < 10) ? '0' + date.getHours() : date.getHours()) + ':' + ((date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()))
      .on('change', function() {
        var date = new Date($(this).val())/1 + (new Date()).getTimezoneOffset()*60000;
        // console.log(date);
        _manager.update(task.id, {
          deadline: date
        });
      });
    $description.find('textarea')
      .val(task.description);

    //description
    var $descriptionInput = $description.find('textarea');
    var $descriptionP = $description.find('p');
    $descriptionInput.val(task.description)
      .on('change', function() {
        _manager.update(task.id, {
          description: $(this).val()
        });
      })
      .hide()
      .on('blur keyup', function(e) {

        if (e.type === 'keyup' && e.keyCode === 91){
          $(this).blur();
          return;
        }else if (e.type === 'keyup' && e.keyCode !== 91){
          return;
        }
        $(this).hide(0);
        $descriptionP.html($(this).val().replace(/\n/g,'<br>')).show();
      });
    $descriptionP.on('click', function() {
      $(this).hide(0, function() {
        $descriptionInput.show().focus();
      });
    });

    //tags
    var $tagsAdd = $tags.find('.add');
    $tagArr = $tags.find('.tag');
    tagEle = $tagArr[$tagArr.length - 1];
    task.tags.map(function(tag, index) {
      var $tag = $tagTemplate.clone();
      var $tagP = $tag.find('p');
      var $tagInput = $tag.find('input');
      var $tagClose = $tag.find('.close');
      $tagInput.remove();
      $tagP.text(tag);
      $tagClose.on('click', function() {
        $tag.remove();
        manager.removeTag(task.id, tag);
      });
      $tag.appendTo($tags);
    });
    appendNewTag();

    function appendNewTag() {
      var $newTag = $tagTemplate.clone();
      var $tagP = $newTag.find('p').hide();
      var $tagInput = $newTag.find('input');
      var $tagClose = $newTag.find('.close');
      $newTag.appendTo($tags);
      $tagInput.on('blur keyup', function(e) {
        var tagText = $(this).val();
        if (e.type === 'keyup' && e.keyCode === 13){
          $(this).blur();
          return;
        }else if (e.type === 'keyup' && e.keyCode !== 13){
          return;
        }else if (e.type === 'keyup' && e.keyCode === 27){
          $(this).val('');
          $newTag.hide();
        }
        var isAdded = manager.addTag(task.id, tagText);
        console.log(isAdded)
        if (isAdded) {
          $(this).hide(0);
          $tagP.text($(this).val()).show();
          $tagClose.off('click').on('click', function() {
            $newTag.remove();
            manager.removeTag(task.id, tagText);
          });
          appendNewTag();
        }else{
          alert('Tag exists');
        }
      });
      $tagsAdd.on('click', function() {
        $newTag.show();
      });
      $newTag.after($tagsAdd).hide();
    }

    //delete
    $delete.on('click', function() {
      manager.remove(task.id);
      self.inflate();
    });
  };
  (function($newContainer) {
    $newItem = $itemTemplate.clone();
    $newItem.appendTo($newContainer);
    $newItem.find('.delete').text('ADD').on('click', function onClick() {
      var statusCheck = $newItem.find('.status input');
      var status = 0;
      if (statusCheck.prop('checked'))
        status = 1;
      var priority = $newItem.find('.priority select').val();
      var title = $newItem.find('.title input').val();
      var deadline = $newItem.find('.deadline input').val();
      var description = $newItem.find('.description textarea').val();
      manager.add({
        status: status,
        title: title,
        priority: priority,
        deadline: deadline,
        description: description
      });
      self.inflate();
    });
  })($('.new'));
}
