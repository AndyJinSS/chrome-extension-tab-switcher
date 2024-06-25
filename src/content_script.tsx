function createReturnButton() {
  const button = document.createElement("button");
  button.textContent = "返回";
  button.style.position = "fixed";
  button.style.top = "10px";
  button.style.right = "10px";
  button.style.width = "80px";
  button.style.height = "40px";
  button.style.zIndex = "1000";
  button.style.color = "white";
  button.style.cursor = "point";
  button.style.border = "none";
  button.style.backgroundColor = "rgba(0,0,0,0.3)";
  button.onclick = () => {
    chrome.runtime.sendMessage({ action: "returntab" });
  };
  document.body.appendChild(button);
}

chrome.runtime.sendMessage(
  {
    action: "checkReturn",
  },
  function (response) {
    console.log("Response from background:", response);
    if (response.visible) {
      createReturnButton();
    }
  },
);

// Add the openTab function to the window object
(window as any).tabPlugin = {
  openTab: (url: string) => {
    chrome.runtime.sendMessage({ action: "opentab", url });
  },
  returnTab: () => {
    chrome.runtime.sendMessage({ action: "returntab" });
  },
};

setTimeout(() => {
  console.log("links ---- DOMContentLoaded");
  // 获取所有的<a>标签
  var links = document.querySelectorAll("a");

  // 遍历所有的<a>标签并添加事件监听器
  links.forEach(function (link) {
    console.log("links", link);
    link.addEventListener("click", function (event) {
      event.preventDefault(); // 阻止默认的点击行为

      // 在这里可以添加自定义的逻辑
      console.log("拦截的链接:", link.href);

      chrome.runtime.sendMessage(
        {
          action: "opentab",
          url: link.href,
        },
        function (response) {
          console.log("Response from background:", response);
        },
      );
    });
  });
}, 3000);
