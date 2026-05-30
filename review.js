const markReviewedButton = document.querySelector("#markReviewed");
const reviewStatus = document.querySelector("#reviewStatus");
const reviewChecks = document.querySelectorAll(".review-checklist input[type='checkbox']");

function updateReviewStatus() {
  const checkedCount = [...reviewChecks].filter((item) => item.checked).length;
  reviewStatus.textContent =
    checkedCount === reviewChecks.length ? "审核完成" : `已完成 ${checkedCount}/${reviewChecks.length}`;
}

reviewChecks.forEach((item) => {
  item.addEventListener("change", updateReviewStatus);
});

markReviewedButton.addEventListener("click", () => {
  reviewChecks.forEach((item) => {
    item.checked = true;
  });
  updateReviewStatus();
});

updateReviewStatus();
