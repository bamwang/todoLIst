// Controller
// var manager;
$(function() {
  var manager = new Manager();
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
  //情報を充填する
  this.inflate = function inflate(key, order, conditions) {
    $container.find('.item').remove();
    manager.getSome(key, order, conditions ? conditions : []).map(function(task, index) {
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
  //動的に動くようにハンドラーをバインドする
  var bind = function bind($item, task) {
    var $status = $item.find('.status');
    var $title = $item.find('.title');
    var $titleP = $title.find('p');
    var $priority = $item.find('.priority');
    var $deadline = $item.find('.deadline');
    var $tags = $item.find('.tags');
    var $description = $item.find('.description');
    var $delete = $item.find('.delete');
    var $show = $item.find('.show');
    var $sub = $item.find('.sub');
    // status
    $status.find('input').prop('checked', task.status == 1)
      .on('change', function(e) {
        _manager.update(task.id, {
          status: ($(this).prop('checked')) ? 1 : 0
        });
        if($(this).prop('checked'))
          $titleP.addClass('done');
        else
          $titleP.removeClass('done');
      });

    //title
    var $titleInput = $title.find('input');
    $titleInput.val(task.title)
      .on('change', function() {
        _manager.update(task.id, {
          title: $(this).val()
        });
      })
      .hide()
      .on('blur keyup', function(e) {
        if (e.type === 'keyup' && e.keyCode === 13){//エンターキー
          $(this).blur();
          return;
        }else if (e.type === 'keyup' && e.keyCode !== 13){
          return;
        }
        $(this).hide(0);
        $titleP.text($(this).val()).show();
      });
      if(task.status===1)
        $titleP.addClass('done');
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
      .val(date.getFullYear() + '-' + ((date.getMonth()+1 < 10) ? '0' + (date.getMonth()+1) : (date.getMonth()+1)) + '-' + ((date.getDate() < 10) ? '0' + date.getDate() : date.getDate()))
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
        $descriptionInput.show().height($(this).height()).focus();
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
      $tagClose.on('click',function(){
        $(this).val('');
        $newTag.hide();
      });
      $tagInput.on('keyup', function(e) {
        var tagText = $(this).val();
        if ( e.keyCode !== 13 && e.keyCode !== 27 ){
          return;
        }else if (e.keyCode === 13){
          $(this).blur();
          return;
        }else if (e.keyCode === 27){
          $(this).val('');
          $newTag.hide();
          $(this).off('blur');
        }
      });

      $tagsAdd.on('click', function() {
        $newTag.show();
        $tagInput.focus().on('blur', function(){
          var tagText = $(this).val();
          if(!tagText){
            $newTag.hide();
            return;
          }
          var isAdded = manager.addTag(task.id, tagText);
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
      });
      $newTag.after($tagsAdd).hide();
    }
    //show
    var open = false;
    $show.on('click',function(){
      if(open){
        $sub.slideUp();
        $show.text('▲');
        open=false;
      }else{
        $show.text('▼');
        $sub.slideDown();
        open=true;
      }
    });

    //delete
    $delete.on('click', function() {
      manager.remove(task.id);
      self.inflate();
    });
  };
  (function bindNew($newContainer) {//新規追加
    $newItem = $itemTemplate.clone();
    $newItem.appendTo($newContainer);
    $newItem.remove('.sub');
    $show = $newItem.find('.tags').html('');
    $show = $newItem.find('.show');
    $show.html('');
    $('<button>').text('+').appendTo($show).on('click', function onClick() {
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
      $newItem.find('input,select').val('');
      self.inflate();
    });
  })($('.new'));
  (function bindTitleBar($titleBar){//ソートバー
    var $status = $titleBar.find('.status input');
    var $title = $titleBar.find('.title');
    var $priority = $titleBar.find('.priority');
    var $deadline = $titleBar.find('.deadline');
    var mod3 = 0;//2:all 0:un 1:done
    $status.prop('checked', false).prop('indeterminate', true);
    $status.on('change',function(){
      if( mod3 === 0 ){
        self.inflate(null,null,[{key: 'status', value: 1, result: true}]);
        $(this).prop('checked', true).prop('indeterminate', false);
      }else if( mod3 === 1 ){
        self.inflate(null,null,[{key: 'status', value: 0, result: true}]);
        $(this).prop('checked', false).prop('indeterminate', false);
      }else{
        self.inflate(null,null,[]);
        $(this).prop('checked', false).prop('indeterminate', true);
      }
      mod3 = ++mod3 % 3;
    });
    var isTitleASC = false;
    $title.on('click',function(){
      if(isTitleASC){
        self.inflate('title','DESC');
        $(this).removeClass('ASC').addClass('DESC');
        isTitleASC=false;
      }else{
        self.inflate('title','ASC');
        $(this).removeClass('DESC').addClass('ASC');
        isTitleASC=true;
      }
    });
    var isPriorityASC = false;
    $priority.on('click',function(){
      if(isPriorityASC){
        self.inflate('priority','DESC');
        $(this).removeClass('ASC').addClass('DESC');
        isPriorityASC=false;
      }else{
        self.inflate('priority','ASC');
        $(this).removeClass('DESC').addClass('ASC');
        isPriorityASC=true;
      }
    });
    var isDeadlineASC = false;
    $deadline.on('click',function(){
      if(isDeadlineASC){
        self.inflate('deadline','DESC');
        $(this).removeClass('ASC').addClass('DESC');
        isDeadlineASC=false;
      }else{
        self.inflate('deadline','ASC');
        $(this).removeClass('DESC').addClass('ASC');
        isDeadlineASC=true;
      }
    });
  })($('.title_bar'));
}
