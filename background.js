var selection = null;

function initScraper()
{
  selection = new Array();
  var select = document.getSelection();
  selection.push(select.getRangeAt(0).commonAncestorContainer);
}

function expandSelection()
{
  var hadSibling = false;
  if(selection[0].previousSibling != null)
  {
    selection.unshift(selection[0].previousSibling);
    hadSibling = true;
  }
  var index = selection.length - 1;
  if(selection[index].nextSibling != null)
  {
    selection.push(selection[index].nextSibling);
    hadSibling = true;
  }
  if(!hadSibling)
  {
    var parent = selection[0].parentNode;
    selection = new Array();
    selection[0] = parent;
  }
}

function getSelected()
{
  var arr = getLeafNodes(selection);
  var select = new Array();
  arr.forEach(function(item) {select.push(item.textContent);});
  return select.join(" ");
}

function cleanForRegex(str)
{
  return str.replace(/[-\/\\^$*+?.()|[\]{}"]/g, '\\$&').replace(/\\\(\\\.\\\*\\\?\\\)/g, "(.*?)").replace(/\\\.\\\*\\\?/g, ".*?");
}

function getLeafNodes(arr)
{
  var newArr = new Array();
  for(var i = 0; i < arr.length; i++)
  {
    if(arr[i].childNodes.length == 0)
    {
      newArr = newArr.concat(arr[i]);
    }
    else
    {
      newArr = newArr.concat(getLeafNodes(arr[i].childNodes));
    }
  }
  return newArr;
}

function getMatches(highlighted)
{
console.log(highlighted);
  var regex = getRegex(highlighted);
  console.log(regex);
  var regexp = new RegExp(regex, "gm");
  var matches = new Array();
  var match;
  while ((match = regexp.exec(document.body.innerHTML)) != null) {
    console.log(match);
    var individualMatch = new Array();
    for (var i = 1; i < match.length; i++) {
      individualMatch.push(match[i]);
    }
    matches.push(individualMatch.join(" "));
  }
  return matches;
}

function getRegex(highlighted)
{
  var arr = selection;
  var indices = new Array();
  var wanted = new Array();
  var check;
  while((check = highlighted.search("<span class=\"scraperHighlighted(.*?)\">")) != -1)
  {
    wanted.push(highlighted.charAt(check + 31) == 'W');
    indices.push(check);
    highlighted = highlighted.replace(/<span class=\"scraperHighlighted(.*?)\">/, "");
    check = highlighted.search("</span>");
    indices.push(check);
    highlighted = highlighted.replace(/<\/span>/, "");
  }
  
  var regex = "";
  var index = 0;
  var content, len, leaves, elem, tArr;
  var haveOpen = false;
  
  arr.forEach(function(elem)
  {
    elem = elem.cloneNode(true);
    tArr = new Array();
    tArr.push(elem);
    leaves = getLeafNodes(tArr);
    leaves.forEach(function(item)
    {
      content = item.textContent;
      len = content.length;
      
      if(indices[0] < index + len && !haveOpen)
      {
        while(indices[0] < index + len && !haveOpen)
        {
          if(indices[1] <= index + len)
          {
            if(wanted[0])
            {
              item.textContent = item.textContent.replace(content.substring(indices[0] - index, indices[1] - index), "(.*?)");
            }
            else
            {
              item.textContent = item.textContent.replace(content.substring(indices[0] - index, indices[1] - index), ".*?");
            }
            indices.shift();
            indices.shift();
            wanted.shift();
          }
          else
          {
            if(wanted[0])
            {
              item.textContent = item.textContent.replace(content.substring(indices[0] - index), "(.*?)");
            }
            else
            {
              item.textContent = item.textContent.replace(content.substring(indices[0] - index), ".*?");
            }
            haveOpen = true;
            indices.shift();
          }
        }
      }
      else
      {
        if(haveOpen)
        {
          if(indices[0] <= index + len)
          {
            if(wanted[0])
            {
              item.textContent = item.textContent.replace(content.substring(0, indices[0] - index), "(.*?)");
            }
            else
            {
              item.textContent = item.textContent.replace(content.substring(0, indices[0] - index), ".*?");
            }
            haveOpen = false;
            indices.shift();
            wanted.shift();
            
            while(indices[0] < index + len && !haveOpen)
            {
              if(indices[1] <= index + len)
              {
                if(wanted[0])
                {
                  item.textContent = item.textContent.replace(content.substring(indices[0] - index, indices[1] - index), "(.*?)");
                }
                else
                {
                  item.textContent = item.textContent.replace(content.substring(indices[0] - index, indices[1] - index), ".*?");
                }
                indices.shift();
                indices.shift();
                wanted.shift();
              }
              else
              {
                if(wanted[0])
                {
                  item.textContent = item.textContent.replace(content.substring(indices[0] - index), "(.*?)");
                }
                else
                {
                  item.textContent = item.textContent.replace(content.substring(indices[0] - index), ".*?");
                }
                haveOpen = true;
                indices.shift();
              }
            }
          }
          else
          {
            if(wanted[0])
            {
              item.textContent = item.textContent.replace(content, "(.*?)");
            }
            else
            {
              item.textContent = item.textContent.replace(content, ".*?");
            }
          }
        }
      }
      index += len + 1;
    });
    regex += elem.outerHTML;
  });
  regex = regex.replace(/href=\".*?\"/g, "href=\".*?\"");
  regex = regex.replace(/id=\".*?\"/g, "id=\".*?\"");
  regex = regex.replace(/src=\".*?\"/g, "src=\".*?\"");
  regex = regex.replace(/title=\".*?\"/g, "title=\".*?\"");
  regex = regex.replace(/alt=\".*?\"/g, "alt=\".*?\"");
  return cleanForRegex(regex);
}

loadcss = document.createElement('link');
loadcss.setAttribute("rel", "stylesheet");
loadcss.setAttribute("type", "text/css");
loadcss.setAttribute("href", "http://www.oneblueham.com/hack.css");
document.getElementsByTagName("head")[0].appendChild(loadcss);

$('body').prepend("<div id=\"boundingbox\"><h3 id=\"iwin\">scraper.</h3></div>"+
	"<body>"+
    "<div id=\"default-button-div\">"+
	  "<button id=\"clickme\" type=\"button\" class=\"btn\">Load</button>"+
      "<button id=\"wanted\" type=\"button\" class=\"btn\">I Want This</button>"+
      "<button id=\"unwanted\" type=\"button\" class=\"btn\">I Don't Want This</button>"+
    "</div><!-- default-button-div -->"+
    "<div id=\"specificity-div\">"+
      "<br>"+
      "<button type=\"button\" class=\"btn btn-large btn-danger\" id=\"find\">Find!</button>"+
    "</div><!-- specificity-div -->"+
    "</div><!-- bounding box -->"+
    "<hr>"+
    "<div id=\"search-div\">"+
    "</div>");

$('#clickme').click(function() {
	initScraper();
	$('h3').text(getSelected());
});

$('#wanted').click(function() {
	var range = window.getSelection().getRangeAt(0);
	var newNode = document.createElement('span');
	newNode.className = "scraperHighlightedWanted";
	range.surroundContents(newNode);
})

$('#unwanted').click(function() {
	var range = window.getSelection().getRangeAt(0);
	var newNode = document.createElement('span');
	newNode.className = "scraperHighlightedUnwanted";
	range.surroundContents(newNode);
})

$('#find').click(function() {
	var matches = getMatches(document.getElementById("iwin").innerHTML);
	for (var i = 0; i < matches.length; i++) {
		var match = matches[i];
		$('#search-div').append("<p>"+match+"</p>");
	}
	console.log(matches);
});
