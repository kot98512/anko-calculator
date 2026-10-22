const grossWeightInput = document.getElementById("gross-weight");

const netResult = document.getElementById("net-result");
const sugarResult = document.getElementById("sugar-result");
const waterResult = document.getElementById("water-result");
const totalResult = document.getElementById("total-result");
const errorMessage = document.getElementById("error-message");
const netKg = document.getElementById("net-kg");
const sugarKg = document.getElementById("sugar-kg");
const waterKg = document.getElementById("water-kg");
const totalKg = document.getElementById("total-kg");
const grossKg = document.getElementById("gross-kg");

// A・Bそれぞれの計算内容を保持する
const tabs = {
  A: {
    tare: null,
    bag: 0,
    bean: null,
    rate: null,
    grossWeight: ""
  },
  B: {
    tare: null,
    bag: 0,
    bean: null,
    rate: null,
    grossWeight: ""
  }
};

let currentTab = "A";

function currentData() {
  return tabs[currentTab];
}

function formatWeight(weight) {
  return `${Math.round(weight).toLocaleString("ja-JP")} g`;
}

// ボタン選択状態を画面に反映
function updateButtons() {
  const data = currentData();

  document.querySelectorAll("[data-tare]").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.tare !== "" &&
      Number(button.dataset.tare) === data.tare
    );
  });

  document.querySelectorAll("[data-bag]").forEach((button) => {
    button.classList.toggle(
      "selected",
      Number(button.dataset.bag) === data.bag
    );
  });

  document.querySelectorAll("[data-bean]").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.bean === data.bean
    );
  });

  document.getElementById("tab-a").classList.toggle(
    "active", currentTab === "A"
  );
  document.getElementById("tab-b").classList.toggle(
    "active", currentTab === "B"
  );

  document.getElementById("tab-a").setAttribute(
    "aria-selected", String(currentTab === "A")
  );
  document.getElementById("tab-b").setAttribute(
    "aria-selected", String(currentTab === "B")
  );
}

// タブを切り替える
function switchTab(name) {
  // 今の入力値を保存
  currentData().grossWeight = grossWeightInput.value;

  currentTab = name;

  // 切り替え先の入力値を復元
  grossWeightInput.value = currentData().grossWeight;

  updateButtons();
  calculate();
}

document.getElementById("tab-a").addEventListener("click", () => {
  switchTab("A");
});

document.getElementById("tab-b").addEventListener("click", () => {
  switchTab("B");
});

// 風袋を選択
document.querySelectorAll("[data-tare]").forEach((button) => {
  if (button.disabled || button.dataset.tare === "") return;

  button.addEventListener("click", () => {
    currentData().tare = Number(button.dataset.tare);
    updateButtons();
    calculate();
  });
});

// 生あん袋を選択
document.querySelectorAll("[data-bag]").forEach((button) => {
  button.addEventListener("click", () => {
    currentData().bag = Number(button.dataset.bag);
    updateButtons();
    calculate();
  });
});

// あんこの種類を選択
document.querySelectorAll("[data-bean]").forEach((button) => {
  button.addEventListener("click", () => {
    currentData().bean = button.dataset.bean;
    currentData().rate = Number(button.dataset.rate);
    updateButtons();
    calculate();
  });
});

// 総重量を入力
grossWeightInput.addEventListener("input", () => {
  currentData().grossWeight = grossWeightInput.value;
  calculate();
});
function calculate() {
  const data = currentData();
  const grossText = grossWeightInput.value;
  const grossWeight = Number(grossText);

  errorMessage.textContent = "";

  // 入力した総重量をkgに変換して表示
  grossKg.textContent =
    grossText.trim() !== "" &&
    Number.isFinite(grossWeight) &&
    grossWeight > 0
      ? `${(grossWeight / 1000).toFixed(3)} kg`
      : "---";

  // 必要な項目が未入力なら計算結果を消す
  if (
    grossText.trim() === "" ||
    data.tare === null ||
    data.rate === null
  ) {
    clearResults();
    return;
  }

  // 総重量の入力チェック
  if (!Number.isFinite(grossWeight) || grossWeight <= 0) {
    clearResults();
    errorMessage.textContent = "総重量を正しく入力してください。";
    return;
  }

  // あんこの実重量を計算
  const netWeight = grossWeight - data.tare - data.bag;

  if (netWeight <= 0) {
    clearResults();
    errorMessage.textContent =
      "総重量が風袋と袋の重量以下になっています。";
    return;
  }

  // ザラメと水の重量を計算
  const sugar = Math.round(netWeight * data.rate / 100);
  const water = Math.round(netWeight * 0.35);

  // 合計重量を計算
  const total = Math.round(netWeight) + sugar + water;

  // g表示
  netResult.textContent = formatWeight(netWeight);
  sugarResult.textContent = formatWeight(sugar);
  waterResult.textContent = formatWeight(water);
  totalResult.textContent = formatWeight(total);

  // kg表示
  netKg.textContent =
    `(${(Math.round(netWeight) / 1000).toFixed(3)} kg)`;
  sugarKg.textContent =
    `(${(sugar / 1000).toFixed(3)} kg)`;
  waterKg.textContent =
    `(${(water / 1000).toFixed(3)} kg)`;
  totalKg.textContent =
    `(${(total / 1000).toFixed(3)} kg)`;
}

function clearResults() {
  netResult.textContent = "---";
  sugarResult.textContent = "---";
  waterResult.textContent = "---";
  totalResult.textContent = "---";

  netKg.textContent = "";
  sugarKg.textContent = "";
  waterKg.textContent = "";
  totalKg.textContent = "";
}

// 最初の表示
updateButtons();
calculate();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => {
        console.log("オフライン対応の準備ができました");
      })
      .catch((error) => {
        console.error("サービスワーカーの登録に失敗しました:", error);
      });
  });
}